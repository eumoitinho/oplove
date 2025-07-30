import { toast } from "sonner"

// Custom notification service that uses timeline-style toasts for everything
export const notification = {
  success: (message: string, options?: any) => {
    toast.success(message, {
      className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
      descriptionClassName: "text-gray-600 dark:text-gray-400",
      duration: 4000,
      ...options
    })
  },
  
  error: (message: string, options?: any) => {
    toast.error(message, {
      className: "bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800",
      descriptionClassName: "text-gray-600 dark:text-gray-400",
      duration: 5000,
      ...options
    })
  },
  
  info: (message: string, options?: any) => {
    toast.info(message, {
      className: "bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800",
      descriptionClassName: "text-gray-600 dark:text-gray-400",
      duration: 4000,
      ...options
    })
  },
  
  warning: (message: string, options?: any) => {
    toast.warning(message, {
      className: "bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-800",
      descriptionClassName: "text-gray-600 dark:text-gray-400",
      duration: 4000,
      ...options
    })
  },
  
  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
      descriptionClassName: "text-gray-600 dark:text-gray-400",
      ...options
    })
  },
  
  promise: <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }, options?: any) => {
    return toast.promise(promise, messages, {
      className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
      descriptionClassName: "text-gray-600 dark:text-gray-400",
      ...options
    })
  },
  
  custom: (jsx: React.ReactNode, options?: any) => {
    return toast.custom(jsx, {
      className: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg",
      ...options
    })
  },
  
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  }
}