import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { z } from "zod"

const createPostSchema = z.object({
  content: z.string().min(1).max(1000),
  visibility: z.enum(["public", "followers", "private"]),
  media_urls: z.array(z.string().url()).nullable().optional(),
  poll_data: z.object({
    question: z.string().min(1).max(120),
    options: z.array(z.object({
      id: z.string(),
      text: z.string().min(1).max(50)
    })).min(2).max(4),
    duration: z.number().min(1).max(168), // hours
    allowMultiple: z.boolean().optional()
  }).nullable().optional(),
  location_data: z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
  }).nullable().optional(),
  scheduled_at: z.string().datetime().nullable().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = createPostSchema.parse(body)

    // Get user profile with premium info
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    // Check premium features
    const canUploadMedia = ["gold", "diamond", "couple"].includes(profile.premium_type)
    const canCreatePolls = ["gold", "diamond", "couple"].includes(profile.premium_type)
    const canSchedulePosts = ["diamond", "couple"].includes(profile.premium_type)
    const canAddLocation = ["gold", "diamond", "couple"].includes(profile.premium_type)

    // Validate features based on plan
    if (validatedData.media_urls && validatedData.media_urls.length > 0 && !canUploadMedia) {
      return NextResponse.json(
        { error: "Media upload requires Gold plan or higher" },
        { status: 403 }
      )
    }

    if (validatedData.poll_data && !canCreatePolls) {
      return NextResponse.json(
        { error: "Creating polls requires Gold plan or higher" },
        { status: 403 }
      )
    }

    if (validatedData.scheduled_at && !canSchedulePosts) {
      return NextResponse.json(
        { error: "Scheduling posts requires Diamond plan or higher" },
        { status: 403 }
      )
    }

    if (validatedData.location_data && !canAddLocation) {
      return NextResponse.json(
        { error: "Adding location requires Gold plan or higher" },
        { status: 403 }
      )
    }

    // Check content length based on plan
    const maxLength = profile.premium_type === "free" ? 280 : 
                     profile.premium_type === "gold" ? 500 : 1000
    
    if (validatedData.content.length > maxLength) {
      return NextResponse.json(
        { error: `Content exceeds maximum length of ${maxLength} characters` },
        { status: 400 }
      )
    }

    // Check media limits
    if (validatedData.media_urls && validatedData.media_urls.length > 0) {
      const maxImages = profile.premium_type === "gold" ? 5 : 
                       profile.premium_type === "free" ? 0 : -1 // -1 means unlimited
      
      if (maxImages !== -1 && validatedData.media_urls.length > maxImages) {
        return NextResponse.json(
          { error: `Maximum ${maxImages} images allowed per post` },
          { status: 400 }
        )
      }

      // Check monthly limit
      if (profile.monthly_photo_limit !== -1 && 
          profile.monthly_photo_count + validatedData.media_urls.length > profile.monthly_photo_limit) {
        return NextResponse.json(
          { error: "Monthly photo upload limit reached" },
          { status: 403 }
        )
      }
    }

    // Create post
    const postData = {
      user_id: user.id,
      content: validatedData.content,
      visibility: validatedData.visibility,
      media_urls: validatedData.media_urls,
      poll_data: validatedData.poll_data,
      location_data: validatedData.location_data,
      scheduled_at: validatedData.scheduled_at,
      is_scheduled: !!validatedData.scheduled_at,
      created_at: new Date().toISOString(),
    }

    const { data: newPost, error: postError } = await supabase
      .from("posts")
      .insert(postData)
      .select(`
        *,
        user:users(
          id,
          username,
          full_name,
          avatar_url,
          is_verified,
          premium_type
        )
      `)
      .single()

    if (postError) {
      console.error("Error creating post:", postError)
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      )
    }

    // Create poll if provided
    if (validatedData.poll_data && newPost) {
      const { data: poll, error: pollError } = await supabase
        .from("polls")
        .insert({
          post_id: newPost.id,
          question: validatedData.poll_data.question,
          expires_at: new Date(Date.now() + validatedData.poll_data.duration * 60 * 60 * 1000).toISOString(),
          allow_multiple: validatedData.poll_data.allowMultiple || false,
        })
        .select()
        .single()

      if (!pollError && poll) {
        // Create poll options
        const optionsData = validatedData.poll_data.options.map((option, index) => ({
          poll_id: poll.id,
          text: option.text,
          order_index: index,
        }))

        await supabase
          .from("poll_options")
          .insert(optionsData)
      }
    }

    // Update user's monthly photo count if media was uploaded
    if (validatedData.media_urls && validatedData.media_urls.length > 0) {
      await supabase
        .from("users")
        .update({ 
          monthly_photo_count: profile.monthly_photo_count + validatedData.media_urls.length 
        })
        .eq("id", user.id)
    }

    // Extract mentions from content
    const mentions = validatedData.content.match(/@(\w+)/g)
    if (mentions) {
      const usernames = mentions.map(m => m.substring(1))
      
      // Get mentioned users
      const { data: mentionedUsers } = await supabase
        .from("users")
        .select("id")
        .in("username", usernames)

      if (mentionedUsers && mentionedUsers.length > 0) {
        // Create mention records
        const mentionData = mentionedUsers.map(mentionedUser => ({
          post_id: newPost.id,
          user_id: user.id,
          mentioned_user_id: mentionedUser.id,
        }))

        await supabase
          .from("mentions")
          .insert(mentionData)

        // Create notifications for mentioned users
        const notificationData = mentionedUsers.map(mentionedUser => ({
          user_id: mentionedUser.id,
          type: "mention",
          title: "Nova menção",
          message: `${profile.full_name || profile.username} mencionou você em um post`,
          data: { post_id: newPost.id, user_id: user.id },
        }))

        await supabase
          .from("notifications")
          .insert(notificationData)
      }
    }

    // Extract and create hashtags
    const hashtags = validatedData.content.match(/#(\w+)/g)
    if (hashtags) {
      const tagNames = hashtags.map(h => h.substring(1).toLowerCase())
      
      for (const tagName of tagNames) {
        // Upsert hashtag (create if doesn't exist, increment count if exists)
        const { data: hashtag } = await supabase
          .from("hashtags")
          .select()
          .eq("name", tagName)
          .single()

        if (hashtag) {
          await supabase
            .from("hashtags")
            .update({ posts_count: hashtag.posts_count + 1 })
            .eq("id", hashtag.id)
        } else {
          await supabase
            .from("hashtags")
            .insert({ name: tagName, posts_count: 1 })
        }

        // Create post_hashtags relation
        await supabase
          .from("post_hashtags")
          .insert({ 
            post_id: newPost.id, 
            hashtag_name: tagName 
          })
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        data: newPost 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in create post API:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}