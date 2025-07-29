"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "../ui/Button"
import { cn } from "@/lib/utils"

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Default error fallback component with OpenLove styling
 */
function DefaultErrorFallback({ error, resetError, className }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800",
        className,
      )}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Ops! Algo deu errado</h2>

      <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
        Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
      </p>

      {isDevelopment && (
        <details className="mb-6 w-full max-w-lg">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Detalhes do erro (desenvolvimento)
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-gray-100 p-4 text-left text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}

      <div className="flex space-x-3">
        <Button onClick={resetError} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Tentar novamente
        </Button>
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/feed")}
          leftIcon={<Home className="h-4 w-4" />}
        >
          Ir para início
        </Button>
      </div>
    </div>
  )
}

/**
 * Error boundary component for catching and handling React errors
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error, errorInfo) => console.error(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={CustomErrorFallback}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service in production
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

/**
 * Hook for handling async errors in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    console.error("Async error caught:", error)
    setError(error)

    // Report to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error)
    }
  }, [])

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error
  }

  return { handleError, resetError }
}
