import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { withAuth } from "@/lib/auth/server"
import { CONTENT_LIMITS, FILE_LIMITS } from "@/utils/constants"
import { nanoid } from "nanoid"

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

    // Get user profile to check plan and limits
    const { data: profile } = await supabase
      .from("users")
      .select("premium_type, is_verified, monthly_photo_count, monthly_video_count")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { 
          success: false,
          error: "Perfil não encontrado",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 404 }
      )
    }

    // Process FormData
    const formData = await request.formData()
    const content = formData.get("content") as string
    const visibility = formData.get("visibility") as string || "public"
    
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
    const maxLength = profile.premium_type === "free" ? 280 : 
                     profile.premium_type === "gold" ? 500 : 1000
    
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

    // Process media files
    const mediaFiles: File[] = []
    let audioFile: File | null = null
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("media_") && value instanceof File) {
        mediaFiles.push(value)
      } else if (key === "audio" && value instanceof File) {
        audioFile = value
      }
    }

    // Check media upload permissions
    const isPremium = profile.premium_type !== "free"
    
    if (!isPremium && (mediaFiles.length > 0 || audioFile)) {
      return NextResponse.json(
        { 
          success: false,
          error: "PLAN_REQUIRED",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0",
            required_plan: "gold",
            feature: "media_upload"
          }
        },
        { status: 403 }
      )
    }

    // Check media count limits
    if (profile.premium_type === "gold" && mediaFiles.length > 5) {
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

    // Check monthly limits for Gold users
    if (profile.premium_type === "gold") {
      const photoFiles = mediaFiles.filter(f => f.type.startsWith("image/"))
      const videoFiles = mediaFiles.filter(f => f.type.startsWith("video/"))
      
      if (profile.monthly_photo_count + photoFiles.length > 50) {
        return NextResponse.json(
          { 
            success: false,
            error: "LIMIT_EXCEEDED",
            data: null,
            metadata: {
              timestamp: new Date().toISOString(),
              version: "1.0",
              limit_type: "monthly_photos",
              current: profile.monthly_photo_count,
              limit: 50,
              remaining: Math.max(0, 50 - profile.monthly_photo_count)
            }
          },
          { status: 429 }
        )
      }

      // Gold users can't upload videos
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
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content.trim(),
        visibility,
        has_media: mediaFiles.length > 0 || !!audioFile,
        has_poll: false, // TODO: Implement polls
        is_scheduled: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { 
          success: false,
          error: "Erro ao criar post",
          data: null,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0"
          }
        },
        { status: 500 }
      )
    }

    // Upload media files
    const uploadedMedia = []
    
    // Upload images/videos
    for (const file of mediaFiles) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${post.id}/${nanoid()}.${fileExt}`
      const isVideo = file.type.startsWith("video/")
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        })

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from("posts")
          .getPublicUrl(fileName)

        uploadedMedia.push({
          post_id: post.id,
          url: publicUrl,
          type: isVideo ? "video" : "image",
          file_name: fileName,
          file_size: file.size,
          mime_type: file.type
        })
      }
    }

    // Upload audio
    if (audioFile) {
      const fileExt = audioFile.name.split(".").pop()
      const fileName = `${user.id}/${post.id}/audio_${nanoid()}.${fileExt}`
      const audioDuration = formData.get("audio_duration") as string
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, audioFile, {
          contentType: audioFile.type,
          upsert: false
        })

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from("posts")
          .getPublicUrl(fileName)

        uploadedMedia.push({
          post_id: post.id,
          url: publicUrl,
          type: "audio",
          file_name: fileName,
          file_size: audioFile.size,
          mime_type: audioFile.type,
          duration: parseInt(audioDuration) || 0
        })
      }
    }

    // Save media metadata
    if (uploadedMedia.length > 0) {
      await supabase
        .from("post_media")
        .insert(uploadedMedia)
    }

    // Update monthly counters for Gold users
    if (profile.premium_type === "gold") {
      const photoCount = uploadedMedia.filter(m => m.type === "image").length
      
      if (photoCount > 0) {
        await supabase
          .from("users")
          .update({
            monthly_photo_count: profile.monthly_photo_count + photoCount
          })
          .eq("id", user.id)
      }
    }

    // Fetch complete post with relationships
    const { data: completePost } = await supabase
      .from("posts")
      .select(`
        *,
        user:users(id, username, full_name, name, avatar_url, premium_type, is_verified, location),
        media:post_media(id, url, type, thumbnail_url, duration)
      `)
      .eq("id", post.id)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        ...completePost,
        media_urls: uploadedMedia.map(m => m.url),
        audio_url: uploadedMedia.find(m => m.type === "audio")?.url,
        audio_duration: uploadedMedia.find(m => m.type === "audio")?.duration,
        audio_title: content.split('\n')[0]?.substring(0, 50) || "Áudio",
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
    console.error("Error creating post:", error)
    
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