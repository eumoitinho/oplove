import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth/server"
import { CONTENT_LIMITS, FILE_LIMITS } from "@/utils/constants"
import { randomUUID } from "crypto"
import { UserProfileService } from "@/lib/services/user-profile-service"

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  visibility: z.enum(["public", "friends", "private"]).default("public"),
  poll: z.object({
    question: z.string().min(1).max(200),
    options: z.array(z.string().min(1).max(100)).min(2).max(4),
    expires_in_hours: z.number().min(1).max(168).default(24)
  }).optional(),
  location: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  scheduled_for: z.string().datetime().optional()
})

// GET /api/v1/posts - List posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const userId = searchParams.get("userId")
    const following = searchParams.get("following") === "true"

    const supabase = await createServerClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
      .from("posts")
      .select(`
        *,
        user:users(id, username, full_name, name, avatar_url, premium_type, is_verified, location),
        media:post_media(id, url, type, thumbnail_url, duration),
        poll:post_polls(
          id,
          question,
          expires_at,
          options:poll_options(id, text, votes_count)
        ),
        likes:post_likes(count),
        comments:post_comments(count),
        shares:post_shares(count),
        saves:post_saves(count)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)
      .offset(offset)

    // Filter by user if specified
    if (userId) {
      query = query.eq("user_id", userId)
    }

    // Filter by following if specified
    if (following && user) {
      const { data: followingUsers } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id)

      const followingIds = followingUsers?.map(f => f.following_id) || []
      query = query.in("user_id", [...followingIds, user.id])
    }

    // Filter by visibility
    if (!user) {
      query = query.eq("visibility", "public")
    } else {
      query = query.or(`visibility.eq.public,user_id.eq.${user.id}`)
    }

    const { data: posts, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Format response
    const formattedPosts = posts?.map((post: any) => ({
      ...post,
      media_urls: post.media?.map((m: any) => m.url) || [],
      media_types: post.media?.map((m: any) => m.type) || [],
      audio_url: post.media?.find((m: any) => m.type === "audio")?.url,
      audio_duration: post.media?.find((m: any) => m.type === "audio")?.duration,
      audio_title: post.content?.split('\n')[0]?.substring(0, 50) || "Áudio",
      poll: post.poll ? {
        ...post.poll,
        user_vote: null // TODO: Buscar voto do usuário
      } : null,
      is_liked: user ? post.is_liked?.some((like: any) => like.user_id === user.id) : false,
      is_saved: user ? post.is_saved?.some((save: any) => save.user_id === user.id) : false,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
      shares_count: post.shares?.[0]?.count || 0,
      saves_count: post.saves?.[0]?.count || 0,
    }))

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      error: null,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        pagination: {
          limit,
          offset,
          hasMore: posts?.length === limit,
        }
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: "Erro interno do servidor",
        data: null,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0"
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/v1/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: "Não autorizado",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 401 }
      )
    }

    // Get user data to check plan and limits
    let { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, premium_type, is_verified")
      .eq("id", user.id)
      .single()

    console.log("[POST CREATE] User query result:", { userData, userError })

    if (userError || !userData) {
      console.log("[POST CREATE] User not found, creating one for user:", user.id)
      console.log("[POST CREATE] User email:", user.email)
      console.log("[POST CREATE] User error:", userError)
      
      // Try to ensure user exists in users table
      const profileResult = await UserProfileService.ensureUserProfile(user)
      
      if (!profileResult.success) {
        console.error("[POST CREATE] Failed to create user profile:", profileResult.error)
        console.error("[POST CREATE] Error code:", profileResult.code)
        
        // If it's a unique constraint error, the userData might already exist
        if (profileResult.code === '23505') {
          console.log("[POST CREATE] Profile already exists, trying to fetch again...")
          // Try once more to get the userData
          const { data: existingProfile } = await supabase
            .from("users")
            .select("id, premium_type, is_verified")
            .eq("id", user.id)
            .single()
            
          if (existingProfile) {
            userData = existingProfile
            console.log("[POST CREATE] Found existing userData on retry")
          } else {
            return NextResponse.json(
              { 
                success: false,
                error: "Erro ao carregar perfil do usuário",
                data: null,
                metadata: {
                  timestamp: new Date().toISOString(),
                  version: "1.0",
                  userId: user.id
                }
              },
              { status: 500 }
            )
          }
        } else {
          // Last attempt - force create userData with upsert
          console.log("[POST CREATE] Final attempt with upsert...")
          
          const forceProfile = {
            id: user.id,
            auth_id: user.id,
            email: user.email!,
            username: `user${Date.now()}`,
            name: user.email?.split('@')[0] || 'User',
            premium_type: 'free',
            is_verified: false,
            created_at: new Date().toISOString()
          }
          
          const { data: upsertProfile, error: upsertError } = await supabase
            .from("users")
            .upsert(forceProfile, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            })
            .select("id, premium_type, is_verified")
            .single()
          
          if (upsertError || !upsertProfile) {
            console.error("[POST CREATE] Upsert also failed:", upsertError)
            return NextResponse.json(
              { 
                success: false,
                error: "Falha nas políticas RLS do banco",
                details: "Execute o SQL de correção no Supabase Dashboard",
                sql_file: "/supabase/migrations/20250802_fix_all_rls_policies.sql",
                original_error: upsertError?.message || profileResult.error
              },
              { status: 403 }
            )
          }
          
          userData = upsertProfile
          console.log("[POST CREATE] Profile created with upsert:", userData)
        }
      } else {
        console.log("[POST CREATE] Profile created successfully")
        
        // Refresh userData data after creation
        const { data: newProfile } = await supabase
          .from("users")
          .select("id, premium_type, is_verified")
          .eq("id", user.id)
          .single()
          
        if (!newProfile) {
          return NextResponse.json(
            { 
              success: false,
              error: "Erro ao carregar perfil criado",
              data: null,
              metadata: {
                timestamp: new Date().toISOString(),
                version: "1.0"
              }
            },
            { status: 500 }
          )
        }
        
        userData = newProfile
        console.log("[POST CREATE] Profile loaded successfully for user:", user.id)
      }
    }

    // Process FormData
    const formData = await request.formData()
    const content = formData.get("content") as string
    const visibility = formData.get("visibility") as string || "public"
    const pollData = formData.get("poll") as string | null
    
    console.log("[POST CREATE] User:", {
      id: user.id,
      email: user.email,
      plan: userData.premium_type,
      verified: userData.is_verified
    })
    console.log("[POST CREATE] Content length:", content?.length || 0)
    console.log("[POST CREATE] FormData keys:", Array.from(formData.keys()))
    console.log("[POST CREATE] Has poll:", !!pollData)
    
    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "Conteúdo do post é obrigatório",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 400 }
      )
    }

    // Check text length limits based on plan
    const maxLength = userData.premium_type === "free" ? 280 : 
                     userData.premium_type === "gold" ? 500 : 1000
    
    if (content.length > maxLength) {
      return NextResponse.json(
        { 
          success: false,
          error: `LIMIT_EXCEEDED`,
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0",
            limit_type: "text_length",
            current: content.length,
            limit: maxLength
          }
        },
        { status: 403 }
      )
    }

    // Validate poll if provided
    let poll = null
    if (pollData) {
      // Check if user can create polls (Gold+ plan)
      if (userData.premium_type === "free") {
        return NextResponse.json(
          { 
            success: false,
            error: "PLAN_REQUIRED",
            data: null,
            metadata: {
              timestamp: new Date().toISOString(),
              version: "1.0",
              required_plan: "gold",
              feature: "create_polls"
            }
          },
          { status: 403 }
        )
      }

      try {
        poll = JSON.parse(pollData)
        
        // Validate poll structure
        if (!poll.question || !poll.options || poll.options.length < 2 || poll.options.length > 4) {
          throw new Error("Invalid poll structure")
        }
        
        // Validate question length
        if (poll.question.length > 200) {
          throw new Error("Poll question too long")
        }
        
        // Validate options
        for (const option of poll.options) {
          if (!option || option.length > 100) {
            throw new Error("Invalid poll option")
          }
        }
        
        // Validate duration
        if (!poll.expires_in_hours || poll.expires_in_hours < 1 || poll.expires_in_hours > 168) {
          poll.expires_in_hours = 24 // Default to 24 hours
        }
      } catch (error) {
        return NextResponse.json(
          { 
            success: false,
            error: "Invalid poll data",
            data: null,
            metadata: {
              timestamp: new Date().toISOString(),
              version: "1.0"
            }
          },
          { status: 400 }
        )
      }
    }

    // Process media files
    const mediaFiles: File[] = []
    let audioFile: File | null = null
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("media_") && value instanceof File) {
        mediaFiles.push(value)
        console.log("[POST CREATE] Media file:", { name: value.name, type: value.type, size: value.size })
      } else if (key === "audio" && value instanceof File) {
        audioFile = value
        console.log("[POST CREATE] Audio file:", { name: value.name, type: value.type, size: value.size })
      }
    }
    
    console.log("[POST CREATE] Media files count:", mediaFiles.length)
    console.log("[POST CREATE] Has audio file:", !!audioFile)

    // Check media upload permissions for free users
    const isPremium = userData.premium_type !== "free"
    
    // Free users can upload 1 image if verified, but no videos or audio
    if (userData.premium_type === "free") {
      // Check if user is verified for free uploads
      if (!userData.is_verified && (mediaFiles.length > 0 || audioFile)) {
        return NextResponse.json(
          { 
            success: false,
            error: "VERIFICATION_REQUIRED",
            data: null,
            metadata: {
              timestamp: new Date().toISOString(),
              version: "1.0",
              required_verification: true,
              feature: "media_upload"
            }
          },
          { status: 403 }
        )
      }

      // Free users can only upload 1 image, no videos or audio
      if (mediaFiles.length > 1) {
        return NextResponse.json(
          { 
            success: false,
            error: "LIMIT_EXCEEDED",
            data: null,
            metadata: {
              timestamp: new Date().toISOString(),
              version: "1.0",
              limit_type: "media_per_post",
              current: mediaFiles.length,
              limit: 1
            }
          },
          { status: 403 }
        )
      }

      // Free users cannot upload videos or audio
      const hasVideo = mediaFiles.some(f => f.type.startsWith("video/"))
      if (hasVideo || audioFile) {
        return NextResponse.json(
          { 
            success: false,
            error: "PLAN_REQUIRED",
            data: null,
            metadata: {
              timestamp: new Date().toISOString(),
              version: "1.0",
              required_plan: "gold",
              feature: hasVideo ? "video_upload" : "audio_upload"
            }
          },
          { status: 403 }
        )
      }
    }

    // Check media count limits
    if (userData.premium_type === "gold" && mediaFiles.length > 5) {
      return NextResponse.json(
        { 
          success: false,
          error: "LIMIT_EXCEEDED",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0",
            limit_type: "media_per_post",
            current: mediaFiles.length,
            limit: 5
          }
        },
        { status: 403 }
      )
    }

    // Skip monthly limits check - columns don't exist
    // TODO: Implement monthly limits when columns are added to database
    
    // Gold users can't upload videos
    if (userData.premium_type === "gold") {
      const videoFiles = mediaFiles.filter(f => f.type.startsWith("video/"))
      if (videoFiles.length > 0) {
        return NextResponse.json(
          { 
            success: false,
            error: "PLAN_REQUIRED",
            data: null,
            metadata: {
              timestamp: new Date().toISOString(),
              version: "1.0",
              required_plan: "diamond",
              feature: "video_upload"
            }
          },
          { status: 403 }
        )
      }
    }

    // Create post
    console.log("[POST CREATE] Creating post with data:", {
      user_id: user.id,
      content: content.trim(),
      visibility,
      mediaCount: mediaFiles.length,
      hasPoll: !!poll,
    })
    
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content.trim(),
        visibility,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[POST CREATE] Database error:", error)
      return NextResponse.json(
        { 
          success: false,
          error: error.message || "Erro ao criar post",
          code: error.code,
          details: error.details,
          hint: error.hint,
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 500 }
      )
    }

    // Check if post was created successfully
    if (!post || !post.id) {
      console.error("[POST CREATE] Post created but no ID returned")
      return NextResponse.json(
        { 
          success: false,
          error: "Erro ao criar post - ID não retornado",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 500 }
      )
    }

    console.log("[POST CREATE] Post created successfully with ID:", post.id)

    // Upload media files and collect URLs
    const mediaUrls = []
    const mediaTypes = []
    
    // Upload images/videos
    for (const file of mediaFiles) {
      const fileExt = file.name.split(".").pop()
      const fileName = `posts/${user.id}/${post.id}/${randomUUID()}.${fileExt}`
      const isVideo = file.type.startsWith("video/")
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        })

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(fileName)

        mediaUrls.push(publicUrl)
        mediaTypes.push(isVideo ? "video" : "image")
      } else {
        console.error("[POST CREATE] Upload error:", uploadError)
      }
    }

    // Upload audio
    if (audioFile) {
      const fileExt = audioFile.name.split(".").pop()
      const fileName = `posts/${user.id}/${post.id}/audio_${randomUUID()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, audioFile, {
          contentType: audioFile.type,
          upsert: false
        })

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(fileName)

        mediaUrls.push(publicUrl)
        mediaTypes.push("audio")
      }
    }

    // Update post with media URLs if any were uploaded
    if (mediaUrls.length > 0) {
      const { error: updateError } = await supabase
        .from("posts")
        .update({ 
          media_urls: mediaUrls,
          media_types: mediaTypes 
        })
        .eq("id", post.id)
        
      if (updateError) {
        console.error("[POST CREATE] Error updating post with media:", updateError)
      }
    }

    // Create poll if provided
    if (poll) {
      const { data: createdPoll, error: pollError } = await supabase
        .from("polls")
        .insert({
          creator_id: user.id,
          question: poll.question,
          options: poll.options,
          max_options: poll.options.length,
          allows_multiple: false,
          expires_at: new Date(Date.now() + poll.expires_in_hours * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (!pollError && createdPoll) {
        // Link poll to post
        await supabase
          .from("posts")
          .update({ poll_id: createdPoll.id })
          .eq("id", post.id)
      }
    }

    // Skip updating monthly counters - columns don't exist
    // TODO: Implement when columns are added

    // Fetch complete post with relationships
    const { data: completePost, error: fetchError } = await supabase
      .from("posts")
      .select(`
        *,
        user:users(id, username, name, avatar_url, premium_type, is_verified, location),
        poll:polls(*)
      `)
      .eq("id", post.id)
      .single()
      
    if (fetchError) {
      console.error("[POST CREATE] Error fetching complete post:", fetchError)
      // Retornar o post básico mesmo se houver erro
      return NextResponse.json({
        success: true,
        data: {
          ...post,
          user: {
            id: user.id,
            username: userData.username || user.email?.split('@')[0],
            name: userData.name || user.email?.split('@')[0],
            avatar_url: userData.avatar_url || null,
            premium_type: userData.premium_type,
            is_verified: userData.is_verified
          },
          media_urls: mediaUrls,
          audio_url: null,
          poll: null,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          saves_count: 0,
          is_liked: false,
          is_saved: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...completePost,
        poll: completePost?.poll ? {
          id: completePost.poll.id,
          question: completePost.poll.question,
          options: completePost.poll.options,
          expires_at: completePost.poll.expires_at,
          total_votes: 0,
          user_has_voted: false,
          user_votes: []
        } : null,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        saves_count: 0,
        is_liked: false,
        is_saved: false
      },
      error: null,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    })
  } catch (error) {
    console.error("[POST CREATE] Fatal error:", error)
    console.error("[POST CREATE] Error stack:", error instanceof Error ? error.stack : 'No stack')
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.errors[0].message,
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: "Erro interno do servidor",
        data: null,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0"
        }
      },
      { status: 500 }
    )
  }
}