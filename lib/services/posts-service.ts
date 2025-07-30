import { Post } from "@/types/common"

interface FetchPostsParams {
  page?: number
  limit?: number
  userId?: string
  following?: boolean
  feedType?: "for-you" | "following" | "explore"
}

interface PostsResponse {
  data: Post[]
  hasMore: boolean
  total?: number
}

export class PostsService {
  static async fetchPosts({
    page = 1,
    limit = 20,
    userId,
    following = false,
    feedType = "for-you",
  }: FetchPostsParams): Promise<PostsResponse> {
    try {
      const offset = (page - 1) * limit
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (userId) {
        params.append("userId", userId)
      }

      if (feedType === "following") {
        params.append("following", "true")
      }

      const response = await fetch(`/api/v1/posts?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch posts")
      }

      // Transform API response to match component Post interface
      const posts: Post[] = result.data.map((post: any) => ({
        id: post.id,
        user_id: post.user_id,
        user: post.user
          ? {
              id: post.user.id,
              email: post.user.email || "",
              username: post.user.username,
              full_name: post.user.name || post.user.full_name,
              avatar_url: post.user.avatar_url,
              bio: post.user.bio || null,
              location: post.user.location || null,
              website: post.user.website || null,
              is_verified: post.user.is_verified || false,
              premium_type: post.user.premium_type || "free",
              daily_message_limit: post.user.daily_message_limit || 0,
              daily_message_count: post.user.daily_message_count || 0,
              monthly_photo_limit: post.user.monthly_photo_limit || 0,
              monthly_photo_count: post.user.monthly_photo_count || 0,
              monthly_video_limit: post.user.monthly_video_limit || 0,
              monthly_video_count: post.user.monthly_video_count || 0,
              created_at: post.user.created_at || new Date().toISOString(),
              updated_at: post.user.updated_at || new Date().toISOString(),
            }
          : undefined,
        content: post.content,
        media_urls: post.media ? (Array.isArray(post.media) && post.media.length > 0 && typeof post.media[0] === 'object' ? post.media.map((m: any) => m.url) : post.media) : null,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        is_liked: post.is_liked || false,
        is_saved: post.is_saved || false,
        created_at: post.created_at,
        updated_at: post.updated_at || post.created_at,
      }))

      return {
        data: posts,
        hasMore: result.pagination?.hasMore || posts.length === limit,
        total: result.pagination?.total,
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      throw error
    }
  }

  static async likePost(postId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to like post")
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Error liking post:", error)
      throw error
    }
  }

  static async unlikePost(postId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to unlike post")
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Error unliking post:", error)
      throw error
    }
  }

  static async createPost(data: {
    content: string
    media?: { url: string; type: "image" | "video" }[]
    visibility?: "public" | "friends" | "private"
  }): Promise<Post> {
    try {
      const response = await fetch("/api/v1/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          visibility: data.visibility === "friends" ? "followers" : data.visibility,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create post")
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create post")
      }

      // Transform response to match Post interface
      const post = result.data
      return {
        id: post.id,
        user_id: post.user_id,
        user: post.user,
        content: post.content,
        media_urls: post.media ? (Array.isArray(post.media) && post.media.length > 0 && typeof post.media[0] === 'object' ? post.media.map((m: any) => m.url) : post.media) : null,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        is_liked: post.is_liked || false,
        is_saved: post.is_saved || false,
        created_at: post.created_at,
        updated_at: post.updated_at || post.created_at,
      }
    } catch (error) {
      console.error("Error creating post:", error)
      throw error
    }
  }
}