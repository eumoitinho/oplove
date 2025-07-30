import { apiClient, type ApiResponse } from './api'
import { createClient } from '@/app/lib/supabase-browser'
import type { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  UpdateProfileData,
  PasswordResetData,
  VerificationData 
} from '@/types/user.types'

/**
 * Authentication service handling all auth-related operations
 */
export class AuthService {
  private supabase = createClient()

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; session: any }>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return {
          data: null,
          error: this.translateAuthError(error.message),
          success: false,
          status: 400,
        }
      }

      // Fetch user profile data
      const userProfile = await this.getUserProfile(data.user.id)

      return {
        data: {
          user: userProfile.data!,
          session: data.session,
        },
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: 'Erro inesperado durante o login',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<ApiResponse<{ user: User }>> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.fullName,
            username: credentials.username,
          },
        },
      })

      if (error) {
        return {
          data: null,
          error: this.translateAuthError(error.message),
          success: false,
          status: 400,
        }
      }

      if (!data.user) {
        return {
          data: null,
          error: 'Erro ao criar usuário',
          success: false,
          status: 400,
        }
      }

      // Create user profile
      const profileData = {
        id: data.user.id,
        email: credentials.email,
        name: credentials.fullName,
        username: credentials.username,
        avatar_url: null,
        bio: '',
        location: '',
        website: '',
        premium_type: 'free' as const,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: profileError } = await this.supabase
        .from('users')
        .insert([profileData])

      if (profileError) {
        return {
          data: null,
          error: 'Erro ao criar perfil do usuário',
          success: false,
          status: 400,
        }
      }

      return {
        data: { user: profileData as User },
        error: null,
        success: true,
        status: 201,
      }
    } catch (error) {
      return {
        data: null,
        error: 'Erro inesperado durante o cadastro',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        return {
          data: null,
          error: 'Erro ao fazer logout',
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
        error: 'Erro inesperado durante o logout',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get current user session
   */
  async getSession(): Promise<ApiResponse<{ user: User; session: any } | null>> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()

      if (error || !session) {
        return {
          data: null,
          error: null,
          success: true,
          status: 200,
        }
      }

      const userProfile = await this.getUserProfile(session.user.id)

      return {
        data: {
          user: userProfile.data!,
          session,
        },
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: 'Erro ao verificar sessão',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return {
          data: null,
          error: 'Usuário não encontrado',
          success: false,
          status: 404,
        }
      }

      return {
        data: data as User,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: 'Erro ao buscar perfil do usuário',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      const { data: updatedData, error } = await this.supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: 'Erro ao atualizar perfil',
          success: false,
          status: 400,
        }
      }

      return {
        data: updatedData as User,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: 'Erro inesperado ao atualizar perfil',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return {
          data: null,
          error: 'Erro ao enviar email de recuperação',
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
        error: 'Erro inesperado ao resetar senha',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return {
          data: null,
          error: 'Erro ao atualizar senha',
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
        error: 'Erro inesperado ao atualizar senha',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(): Promise<ApiResponse<null>> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: '', // Will use current user's email
      })

      if (error) {
        return {
          data: null,
          error: 'Erro ao enviar email de verificação',
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
        error: 'Erro inesperado ao enviar verificação',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      })

      if (error) {
        return {
          data: null,
          error: 'Token de verificação inválido',
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
        error: 'Erro inesperado na verificação',
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Translate Supabase auth errors to Portuguese
   */
  private translateAuthError(error: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
      'User already registered': 'Este email já está cadastrado',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Invalid email': 'Email inválido',
      'Signup is disabled': 'Cadastro temporariamente desabilitado',
      'Email rate limit exceeded': 'Muitas tentativas. Tente novamente em alguns minutos.',
    }

    return errorMap[error] || 'Erro de autenticação'
  }
}

// Export singleton instance
export const authService = new AuthService()
