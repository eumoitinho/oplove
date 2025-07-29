"use client"
import { toast as hotToast, Toaster } from "react-hot-toast"
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  description?: string
  duration?: number
  onDismiss?: () => void
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
  warning:
    "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
}

/**
 * Custom toast component with OpenLove styling
 */
function CustomToast({ id, type, title, description, onDismiss }: ToastProps) {
  const Icon = toastIcons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border p-4 shadow-lg",
        toastStyles[type],
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            className="inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:hover:bg-white/5"
            onClick={() => {
              hotToast.dismiss(id)
              onDismiss?.()
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Toast utility functions with OpenLove styling
 *
 * @example
 * ```tsx
 * import { toast } from '@/components/common/ui/Toast'
 *
 * // Success toast
 * toast.success('Perfil atualizado!', 'Suas alterações foram salvas com sucesso.')
 *
 * // Error toast
 * toast.error('Erro ao salvar', 'Tente novamente em alguns instantes.')
 *
 * // Custom duration
 * toast.info('Nova mensagem', 'Você tem uma nova mensagem.', { duration: 5000 })
 * ```
 */
export const toast = {
  success: (title: string, description?: string, options?: { duration?: number }) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          id={t.id}
          type="success"
          title={title}
          description={description}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      { duration: options?.duration || 4000 },
    )
  },

  error: (title: string, description?: string, options?: { duration?: number }) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          id={t.id}
          type="error"
          title={title}
          description={description}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      { duration: options?.duration || 5000 },
    )
  },

  warning: (title: string, description?: string, options?: { duration?: number }) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          id={t.id}
          type="warning"
          title={title}
          description={description}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      { duration: options?.duration || 4000 },
    )
  },

  info: (title: string, description?: string, options?: { duration?: number }) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          id={t.id}
          type="info"
          title={title}
          description={description}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      { duration: options?.duration || 4000 },
    )
  },

  dismiss: (toastId?: string) => hotToast.dismiss(toastId),

  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
  ) => {
    return hotToast.promise(promise, {
      loading: msgs.loading,
      success: (data) => {
        const message = typeof msgs.success === "function" ? msgs.success(data) : msgs.success
        return <CustomToast id="" type="success" title={message} />
      },
      error: (error) => {
        const message = typeof msgs.error === "function" ? msgs.error(error) : msgs.error
        return <CustomToast id="" type="error" title={message} />
      },
    })
  },
}

/**
 * Toast provider component - add to your app root
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerClassName="!top-4 !right-4"
      toastOptions={{
        duration: 4000,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          margin: 0,
        },
      }}
    />
  )
}
