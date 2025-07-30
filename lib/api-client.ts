import { createClient } from "@/app/lib/supabase-browser"

interface ApiOptions extends RequestInit {
  requireAuth?: boolean
}

class ApiClient {
  private baseURL = '/api/v1'

  private async getAuthHeaders(): Promise<HeadersInit> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      return {}
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`
    }
  }

  async request<T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<{ data?: T; error?: string }> {
    try {
      const { requireAuth = true, headers = {}, ...fetchOptions } = options
      
      let finalHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...headers
      }
      
      if (requireAuth) {
        const authHeaders = await this.getAuthHeaders()
        finalHeaders = { ...finalHeaders, ...authHeaders }
      }
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        headers: finalHeaders
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { error: data.error || 'Request failed' }
      }
      
      return { data: data.data || data }
    } catch (error) {
      console.error('API request error:', error)
      return { error: 'Network error' }
    }
  }

  // Convenience methods
  get<T = any>(endpoint: string, options?: ApiOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T = any>(endpoint: string, body?: any, options?: ApiOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  put<T = any>(endpoint: string, body?: any, options?: ApiOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  delete<T = any>(endpoint: string, options?: ApiOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()