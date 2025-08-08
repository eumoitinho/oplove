import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/v1/posts - List posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const supabase = await createServerClient()

    // Query with poll and audio columns
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        couple_id,
        content,
        media_urls,
        media_types,
        media_thumbnails,
        visibility,
        is_premium_content,
        price,
        location,
        latitude,
        longitude,
        hashtags,
        mentions,
        post_type,
        story_expires_at,
        is_event,
        event_id,
        poll_id,
        poll_question,
        poll_options,
        poll_expires_at,
        audio_duration,
        likes_count,
        comments_count,
        shares_count,
        saves_count,
        is_reported,
        is_hidden,
        report_count,
        created_at,
        updated_at,
        users!inner(
          id,
          username,
          name,
          avatar_url,
          is_verified,
          premium_type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("[GET POSTS] Database error:", error)
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    // Format response
    const formattedPosts = posts?.map((post: any) => {
      // Format poll data if exists
      let pollData = null
      if (post.poll_question && post.poll_options) {
        pollData = {
          id: `${post.id}_poll`,
          question: post.poll_question,
          options: post.poll_options.map((option: string, index: number) => ({
            id: `${post.id}_option_${index}`,
            text: option,
            votes_count: 0, // TODO: Get real vote counts
            percentage: 0
          })),
          total_votes: 0, // TODO: Get real total votes
          expires_at: post.poll_expires_at,
          multiple_choice: false,
          user_has_voted: false,
          user_votes: []
        }
      }

      return {
        ...post,
        user: post.users,
        media_urls: post.media_urls || [],
        poll: pollData,
        is_liked: false,
        is_saved: false,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        saves_count: 0,
        likes: [],
        comments: [],
      }
    })

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
    console.error("[GET POSTS] Fatal error:", error)
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

// POST /api/v1/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Get user profile with plan info and location data
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('premium_type, is_verified, monthly_photos_uploaded, monthly_photo_limit, latitude, longitude, location, city, uf')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "Perfil não encontrado", success: false },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const content = formData.get('content') as string
    const visibility = formData.get('visibility') as string || 'public'
    // Fix visibility value if it's 'followers' (old value) to 'friends' (DB enum)
    const correctedVisibility = visibility === 'followers' ? 'friends' : visibility
    const pollData = formData.get('poll') as string
    const audioDuration = formData.get('audio_duration') as string
    const location = formData.get('location') as string | null
    const latitude = formData.get('latitude') as string | null
    const longitude = formData.get('longitude') as string | null

    // Validate content
    if (!content?.trim() && !formData.get('audio') && !pollData) {
      let hasMedia = false
      for (const [key] of formData.entries()) {
        if (key.startsWith('media_')) {
          hasMedia = true
          break
        }
      }
      if (!hasMedia) {
        return NextResponse.json(
          { error: "Post deve ter conteúdo, mídia, áudio ou enquete", success: false },
          { status: 400 }
        )
      }
    }

    // Check media upload permissions for free users
    if (userProfile.premium_type === 'free' && !userProfile.is_verified) {
      const hasMedia = Array.from(formData.entries()).some(([key]) => key.startsWith('media_') || key === 'audio')
      if (hasMedia) {
        return NextResponse.json(
          { 
            error: "VERIFICATION_REQUIRED",
            success: false,
            message: "Usuários gratuitos precisam verificar a conta para fazer upload de mídia"
          },
          { status: 403 }
        )
      }
    }

    // Handle media files
    const mediaUrls: string[] = []
    const mediaTypes: string[] = []
    const mediaThumbnails: string[] = []
    
    try {
      // Process regular media files
      for (const [key, file] of formData.entries()) {
        if (key.startsWith('media_') && file instanceof File) {
          console.log(`[POST POSTS] Processing ${key}: ${file.name} (${file.type}, ${file.size} bytes)`)
          
          // Validate file type
          if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            return NextResponse.json(
              { error: `Tipo de arquivo não suportado: ${file.type}`, success: false },
              { status: 400 }
            )
          }

          // Check video permission for free users
          if (file.type.startsWith('video/') && userProfile.premium_type === 'free') {
            return NextResponse.json(
              { 
                error: "PLAN_REQUIRED",
                success: false,
                message: "Upload de vídeo requer plano Gold ou superior"
              },
              { status: 403 }
            )
          }

          // Upload to Supabase Storage
          const fileName = `${user.id}/${Date.now()}-${file.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json(
              { error: `Erro ao fazer upload: ${uploadError.message}`, success: false },
              { status: 500 }
            )
          }

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('media')
            .getPublicUrl(uploadData.path)

          mediaUrls.push(publicUrlData.publicUrl)
          mediaTypes.push(file.type)
          // TODO: Generate thumbnail for images/videos
          mediaThumbnails.push(publicUrlData.publicUrl) // For now, use same URL
        }
      }

      // Process audio file
      const audioFile = formData.get('audio') as File
      if (audioFile && audioFile instanceof File) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[POST POSTS] Processing audio: ${audioFile.name} (${audioFile.type}, ${audioFile.size} bytes)`)
        }
        
        // Validate audio file type
        const supportedAudioTypes = [
          'audio/webm',
          'audio/webm;codecs=opus',
          'audio/mp4',
          'audio/mp4;codecs=aac',
          'audio/wav',
          'audio/wave',
          'audio/x-wav'
        ]
        
        if (!supportedAudioTypes.includes(audioFile.type)) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[POST POSTS] Unsupported audio type: ${audioFile.type}`)
          }
          return NextResponse.json(
            { 
              error: `Formato de áudio não suportado: ${audioFile.type}. Use WebM, MP4 ou WAV.`,
              success: false 
            },
            { status: 400 }
          )
        }
        
        // Check audio permission
        if (userProfile.premium_type === 'free' && !userProfile.is_verified) {
          return NextResponse.json(
            { 
              error: "VERIFICATION_REQUIRED",
              success: false,
              message: "Upload de áudio requer verificação da conta"
            },
            { status: 403 }
          )
        }

        // Upload audio file
        const audioFileName = `${user.id}/audio/${Date.now()}-${audioFile.name}`
        const { data: audioUploadData, error: audioUploadError } = await supabase.storage
          .from('media')
          .upload(audioFileName, audioFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (audioUploadError) {
          console.error('Audio upload error:', audioUploadError)
          return NextResponse.json(
            { error: `Erro ao fazer upload do áudio: ${audioUploadError.message}`, success: false },
            { status: 500 }
          )
        }

        // Get public URL for audio
        const { data: audioPublicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(audioUploadData.path)

        mediaUrls.push(audioPublicUrlData.publicUrl)
        mediaTypes.push(audioFile.type)
      }

    } catch (uploadError) {
      console.error('Media processing error:', uploadError)
      return NextResponse.json(
        { error: "Erro ao processar mídia", success: false },
        { status: 500 }
      )
    }

    // Parse poll data
    let pollOptions: string[] = []
    let pollExpiresAt: string | null = null
    
    if (pollData) {
      try {
        const poll = JSON.parse(pollData)
        if (poll.question && poll.options && Array.isArray(poll.options)) {
          pollOptions = poll.options.filter((opt: string) => opt.trim())
          if (poll.expires_in_hours) {
            const expiresDate = new Date()
            expiresDate.setHours(expiresDate.getHours() + poll.expires_in_hours)
            pollExpiresAt = expiresDate.toISOString()
          }
        }
      } catch (e) {
        console.error('Poll parsing error:', e)
        return NextResponse.json(
          { error: "Dados da enquete inválidos", success: false },
          { status: 400 }
        )
      }
    }

    // Extract hashtags and mentions from content
    const hashtags = content ? [...content.matchAll(/#[a-zA-Z0-9_]+/g)].map(m => m[0]) : []
    const mentions = content ? [...content.matchAll(/@[a-zA-Z0-9_]+/g)].map(m => m[0]) : []

    // Use user's location from profile if no location provided in form
    const finalLatitude = latitude ? parseFloat(latitude) : userProfile.latitude
    const finalLongitude = longitude ? parseFloat(longitude) : userProfile.longitude
    const finalLocation = location || userProfile.location || (userProfile.city && userProfile.uf ? `${userProfile.city}, ${userProfile.uf}` : null)

    // Create post
    const postData = {
      user_id: user.id,
      content: content?.trim() || null,
      visibility: correctedVisibility,
      media_urls: mediaUrls.length > 0 ? mediaUrls : [],
      media_types: mediaTypes.length > 0 ? mediaTypes : [],
      media_thumbnails: mediaThumbnails.length > 0 ? mediaThumbnails : [],
      location: finalLocation,
      latitude: finalLatitude,
      longitude: finalLongitude,
      hashtags: hashtags.length > 0 ? hashtags : [],
      mentions: mentions.length > 0 ? mentions : [],
      post_type: 'regular',
      is_premium_content: false,
      is_event: false,
      is_reported: false,
      is_hidden: false,
      report_count: 0,
      audio_duration: audioDuration ? parseInt(audioDuration) : null,
      poll_question: pollData ? JSON.parse(pollData).question : null,
      poll_options: pollOptions.length > 0 ? pollOptions : null,
      poll_expires_at: pollExpiresAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('[POST POSTS] Creating post with data:', postData)

    const { data: newPost, error: createError } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        users!inner(
          id,
          username,
          name,
          avatar_url
        )
      `)
      .single()

    if (createError) {
      console.error('Post creation error:', createError)
      return NextResponse.json(
        { error: `Erro ao criar post: ${createError.message}`, success: false },
        { status: 500 }
      )
    }

    // Format poll data if exists
    let pollData = null
    if (newPost.poll_question && newPost.poll_options) {
      pollData = {
        id: `${newPost.id}_poll`,
        question: newPost.poll_question,
        options: newPost.poll_options.map((option: string, index: number) => ({
          id: `${newPost.id}_option_${index}`,
          text: option,
          votes_count: 0,
          percentage: 0
        })),
        total_votes: 0,
        expires_at: newPost.poll_expires_at,
        multiple_choice: false,
        user_has_voted: false,
        user_votes: []
      }
    }

    // Format response
    const formattedPost = {
      ...newPost,
      user: newPost.users,
      media_urls: newPost.media_urls || [],
      poll: pollData,
      is_liked: false,
      is_saved: false,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      saves_count: 0,
      likes: [],
      comments: [],
    }

    console.log('[POST POSTS] Post created successfully:', formattedPost.id)

    return NextResponse.json({
      success: true,
      data: formattedPost,
      message: "Post criado com sucesso"
    })

  } catch (error) {
    console.error('[POST POSTS] Fatal error:', error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor", 
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}