import type { ApiResponse } from "./api"
import { createClient } from "@/app/lib/supabase-browser"
import type {
  Post,
  CreatePostData,
  UpdatePostData,
  Comment,
  CreateCommentData,
  PostsFilter,
  PostStats,
} from "@/types/post.types"

/**
 * Posts service handling all post-related operations
 */
export class PostsService {
  private supabase = createClient()

  /**
   * Get posts for timeline with filters
   */
  async getPosts(filter: PostsFilter = {}): Promise<ApiResponse<Post[]>> {
    try {
      let query = this.supabase
        .from("posts")
        .select(`
          *,
          user:users(*),
          media:post_media(*),
          interactions:post_interactions(count),
          comments:post_comments(count)
          user_interaction:post_interactions!inner(type)
        `)
        .order("created_at", { ascending: false })

      // Apply filters
      if (filter.userId) {
        query = query.eq("user_id", filter.userId)
      }

      if (filter.following && filter.currentUserId) {
        // Get posts from followed users
        const { data: following } = await this.supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", filter.currentUserId)

        const followingIds = following?.map((f) => f.following_id) || []
        if (followingIds.length > 0) {
          query = query.in("user_id", followingIds)
        } else {
          // No following users, return empty
          return {
            data: [],
            error: null,
            success: true,
            status: 200,
          }
        }
      }

      if (filter.hashtag) {
        query = query.ilike("content", `%#${filter.hashtag}%`)
      }

      if (filter.limit) {
        query = query.limit(filter.limit)
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 20) - 1)
      }

      const { data, error } = await query

      if (error) {
        return {
          data: null,
          error: "Erro ao carregar posts",
          success: false,
          status: 400,
        }
      }

      return {
        data: data as Post[],
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao carregar posts",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get single post by ID
   */
  async getPost(postId: string): Promise<ApiResponse<Post>> {
    try {
      const { data, error } = await this.supabase
        .from("posts")
        .select(`
          *,
          user:users(*),
          media:post_media(*),
          interactions:post_interactions(count),
          comments:post_comments(
            *,
            user:users(*),
            replies:post_comments(
              *,
              user:users(*)
            )
          )
        `)
        .eq("id", postId)
        .single()

      if (error || !data) {
        return {
          data: null,
          error: "Post não encontrado",
          success: false,
          status: 404,
        }
      }

      return {
        data: data as Post,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro ao carregar post",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Create new post
   */
  async createPost(postData: CreatePostData): Promise<ApiResponse<Post>> {
    try {
      // Check user permissions
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Get user profile to check premium status
      const { data: userProfile } = await this.supabase
        .from("users")
        .select("premium_type, is_verified")
        .eq("id", user.id)
        .single()

      // Check content limits based on plan
      if (postData.media && postData.media.length > 0) {
        const mediaLimits = {
          free: userProfile?.is_verified ? 1 : 0,
          gold: 5,
          diamond: 10,
          couple: 10,
        }

        // Corrigindo o erro de tipagem ao acessar o índice do objeto
        type PremiumType = "free" | "gold" | "diamond" | "couple";
        const premiumType: PremiumType = userProfile?.premium_type as PremiumType || "free";
        const limit = mediaLimits[premiumType];
        if (postData.media.length > limit) {
          return {
            data: null,
            error: `Limite de mídia excedido. Seu plano permite ${limit} arquivo(s).`,
            success: false,
            status: 403,
          }
        }
      }

      // Create post
      const { data: post, error: postError } = await this.supabase
        .from("posts")
        .insert([
          {
            user_id: user.id,
            content: postData.content,
            visibility: postData.visibility || "public",
            location: postData.location,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (postError) {
        return {
          data: null,
          error: "Erro ao criar post",
          success: false,
          status: 400,
        }
      }

      // Upload media if provided
      if (postData.media && postData.media.length > 0) {
        const mediaPromises = postData.media.map(async (file, index) => {
          const fileName = `${post.id}_${index}_${Date.now()}`
          const { data: uploadData, error: uploadError } = await this.supabase.storage
            .from("posts")
            .upload(fileName, file)

          if (uploadError) {
            throw new Error(`Erro ao fazer upload: ${uploadError.message}`)
          }

          const {
            data: { publicUrl },
          } = this.supabase.storage.from("posts").getPublicUrl(fileName)

          return {
            post_id: post.id,
            url: publicUrl,
            type: file.type.startsWith("image/") ? "image" : "video",
            size: file.size,
            order: index,
          }
        })

        try {
          const mediaData = await Promise.all(mediaPromises)

          const { error: mediaError } = await this.supabase.from("post_media").insert(mediaData)

          if (mediaError) {
            // Clean up uploaded files
            await Promise.all(
              mediaData.map((media) => this.supabase.storage.from("posts").remove([media.url.split("/").pop()!])),
            )
            throw new Error("Erro ao salvar mídia")
          }
        } catch (error) {
          // Delete the post if media upload failed
          await this.supabase.from("posts").delete().eq("id", post.id)

          return {
            data: null,
            error: "Erro ao fazer upload da mídia",
            success: false,
            status: 400,
          }
        }
      }

      // Get complete post data
      const completePost = await this.getPost(post.id)
      return completePost
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao criar post",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Update post
   */
  async updatePost(postId: string, updateData: UpdatePostData): Promise<ApiResponse<Post>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Check if user owns the post
      const { data: post } = await this.supabase.from("posts").select("user_id").eq("id", postId).single()

      if (!post || post.user_id !== user.id) {
        return {
          data: null,
          error: "Você não tem permissão para editar este post",
          success: false,
          status: 403,
        }
      }

      const { data: updatedPost, error } = await this.supabase
        .from("posts")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: "Erro ao atualizar post",
          success: false,
          status: 400,
        }
      }

      // Get complete post data
      const completePost = await this.getPost(postId)
      return completePost
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao atualizar post",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<ApiResponse<null>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Check if user owns the post
      const { data: post } = await this.supabase.from("posts").select("user_id").eq("id", postId).single()

      if (!post || post.user_id !== user.id) {
        return {
          data: null,
          error: "Você não tem permissão para deletar este post",
          success: false,
          status: 403,
        }
      }

      // Delete associated media files
      const { data: media } = await this.supabase.from("post_media").select("url").eq("post_id", postId)

      if (media && media.length > 0) {
        const filePaths = media.map((m) => m.url.split("/").pop()!).filter(Boolean)
        if (filePaths.length > 0) {
          await this.supabase.storage.from("posts").remove(filePaths)
        }
      }

      // Delete post (cascade will handle related data)
      const { error } = await this.supabase.from("posts").delete().eq("id", postId)

      if (error) {
        return {
          data: null,
          error: "Erro ao deletar post",
          success: false,
          status: 400,
        }
      }

      return {
        data: null,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao deletar post",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Like/unlike post
   */
  async toggleLike(postId: string): Promise<ApiResponse<{ liked: boolean; count: number }>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Check if already liked
      const { data: existingLike } = await this.supabase
        .from("post_interactions")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("type", "like")
        .single()

      let liked = false

      if (existingLike) {
        // Unlike
        const { error } = await this.supabase.from("post_interactions").delete().eq("id", existingLike.id)

        if (error) {
          return {
            data: null,
            error: "Erro ao remover curtida",
            success: false,
            status: 400,
          }
        }
      } else {
        // Like
        const { error } = await this.supabase.from("post_interactions").insert([
          {
            post_id: postId,
            user_id: user.id,
            type: "like",
            created_at: new Date().toISOString(),
          },
        ])

        if (error) {
          return {
            data: null,
            error: "Erro ao curtir post",
            success: false,
            status: 400,
          }
        }

        liked = true
      }

      // Get updated count
      const { count } = await this.supabase
        .from("post_interactions")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("type", "like")

      return {
        data: { liked, count: count || 0 },
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao curtir post",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Add comment to post
   */
  async addComment(postId: string, commentData: CreateCommentData): Promise<ApiResponse<Comment>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Check user permissions for commenting
      const { data: userProfile } = await this.supabase
        .from("users")
        .select("premium_type, is_verified")
        .eq("id", user.id)
        .single()

      // Free users need verification to comment
      if (userProfile?.premium_type === "free" && !userProfile.is_verified) {
        return {
          data: null,
          error: "Usuários gratuitos precisam verificar a conta para comentar",
          success: false,
          status: 403,
        }
      }

      const { data: comment, error } = await this.supabase
        .from("post_comments")
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: commentData.content,
            parent_id: commentData.parentId || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select(`
          *,
          user:users(*)
        `)
        .single()

      if (error) {
        return {
          data: null,
          error: "Erro ao adicionar comentário",
          success: false,
          status: 400,
        }
      }

      return {
        data: comment as Comment,
        error: null,
        success: true,
        status: 201,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao comentar",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get post statistics
   */
  async getPostStats(postId: string): Promise<ApiResponse<PostStats>> {
    try {
      const [likesResult, commentsResult, sharesResult] = await Promise.all([
        this.supabase
          .from("post_interactions")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId)
          .eq("type", "like"),

        this.supabase.from("post_comments").select("*", { count: "exact", head: true }).eq("post_id", postId),

        this.supabase
          .from("post_interactions")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId)
          .eq("type", "share"),
      ])

      const stats: PostStats = {
        likes: likesResult.count || 0,
        comments: commentsResult.count || 0,
        shares: sharesResult.count || 0,
        views: 0,
        saves: 0
      }

      return {
        data: stats,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro ao carregar estatísticas",
        success: false,
        status: 500,
      }
    }
  }
}

// Export singleton instance
export const postsService = new PostsService()
