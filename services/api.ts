import { createClient } from "@/app/lib/supabase-browser"

/**
 * Base API configuration and utilities
 */
export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
  success: boolean
  status: number
}

export interface ApiRequestConfig {
  retries?: number
  timeout?: number
  signal?: AbortSignal
  headers?: Record<string, string>
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Base API client with retry logic and error handling
 */
export class ApiClient {
  private supabase = createClient()
  private baseURL = process.env.NEXT_PUBLIC_API_URL || "/api"
  private defaultTimeout = 30000
  private defaultRetries = 3

  /**
   * Make authenticated request with retry logic
   */
  async request<T>(endpoint: string, options: RequestInit & ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const {
      retries = this.defaultRetries,
      timeout = this.defaultTimeout,
      signal,
      headers = {},
      ...fetchOptions
    } = options

    // Get auth token
    const {
      data: { session },
    } = await this.supabase.auth.getSession()
    const authHeaders = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}

    const requestHeaders = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const combinedSignal = signal ? this.combineAbortSignals(signal, controller.signal) : controller.signal

        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...fetchOptions,
          headers: requestHeaders,
          signal: combinedSignal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new ApiError(errorData.message || `HTTP ${response.status}`, response.status, errorData.code, errorData)
        }

        const data = await response.json()
        return {
          data,
          error: null,
          success: true,
          status: response.status,
        }
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (error instanceof ApiError && error.status < 500) {
          break
        }

        if (signal?.aborted) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000)
        }
      }
    }

    return {
      data: null,
      error: lastError?.message || "Request failed",
      success: false,
      status: lastError instanceof ApiError ? lastError.status : 500,
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" })
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<{ url: string; path: string }>> {
    const formData = new FormData()
    formData.append("file", file)

    const {
      data: { session },
    } = await this.supabase.auth.getSession()
    const authHeaders = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText)
          resolve({
            data,
            error: null,
            success: true,
            status: xhr.status,
          })
        } else {
          resolve({
            data: null,
            error: `Upload failed: ${xhr.statusText}`,
            success: false,
            status: xhr.status,
          })
        }
      })

      xhr.addEventListener("error", () => {
        resolve({
          data: null,
          error: "Upload failed",
          success: false,
          status: xhr.status,
        })
      })

      xhr.open("POST", `${this.baseURL}${endpoint}`)

      // Set auth headers
      Object.entries(authHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      xhr.send(formData)
    })
  }

  /**
   * Combine multiple abort signals
   */
  private combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController()

    signals.forEach((signal) => {
      if (signal.aborted) {
        controller.abort()
      } else {
        signal.addEventListener("abort", () => controller.abort())
      }
    })

    return controller.signal
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
