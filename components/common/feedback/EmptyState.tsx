"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Search, Heart, MessageCircle, Users, Calendar, ImageIcon, FileText, Inbox } from "lucide-react"
import { Button } from "../ui/Button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  variant?: "search" | "posts" | "messages" | "followers" | "events" | "media" | "notifications" | "custom"
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: {
    label: string
    onClick: () => void
    variant?: "primary" | "secondary"
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

const emptyStateConfig = {
  search: {
    icon: Search,
    title: "Nenhum resultado encontrado",
    description: "Tente ajustar sua busca ou usar palavras-chave diferentes.",
  },
  posts: {
    icon: FileText,
    title: "Nenhum post ainda",
    description: "Seja o primeiro a compartilhar algo interessante!",
  },
  messages: {
    icon: MessageCircle,
    title: "Nenhuma conversa",
    description: "Comece uma nova conversa para se conectar com pessoas.",
  },
  followers: {
    icon: Users,
    title: "Nenhum seguidor ainda",
    description: "Compartilhe conteúdo interessante para atrair seguidores.",
  },
  events: {
    icon: Calendar,
    title: "Nenhum evento",
    description: "Crie ou participe de eventos para conhecer pessoas.",
  },
  media: {
    icon: ImageIcon,
    title: "Nenhuma mídia",
    description: "Compartilhe fotos e vídeos para tornar seu perfil mais atrativo.",
  },
  notifications: {
    icon: Inbox,
    title: "Nenhuma notificação",
    description: "Você está em dia! Não há notificações pendentes.",
  },
}

/**
 * Empty state component with OpenLove styling and animations
 *
 * @example
 * \`\`\`tsx
 * <EmptyState
 *   variant="posts"
 *   action={{
 *     label: "Criar primeiro post",
 *     onClick: () => setShowCreatePost(true)
 *   }}
 * />
 *
 * <EmptyState
 *   variant="custom"
 *   title="Sem resultados"
 *   description="Tente uma busca diferente"
 *   icon={Search}
 * />
 * \`\`\`
 */
export function EmptyState({
  variant = "custom",
  title,
  description,
  icon,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const config = variant !== "custom" ? emptyStateConfig[variant] : {}
  const Icon = icon || config.icon || Heart
  const finalTitle = title || config.title || "Nada por aqui"
  const finalDescription = description || config.description || "Não há conteúdo para mostrar no momento."

  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "h-12 w-12",
      iconContainer: "h-20 w-20",
      title: "text-lg",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "h-16 w-16",
      iconContainer: "h-24 w-24",
      title: "text-xl",
      description: "text-base",
    },
    lg: {
      container: "py-16",
      icon: "h-20 w-20",
      iconContainer: "h-28 w-28",
      title: "text-2xl",
      description: "text-lg",
    },
  }

  const currentSize = sizeClasses[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("flex flex-col items-center justify-center text-center", currentSize.container, className)}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={cn(
          "mb-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800",
          currentSize.iconContainer,
        )}
      >
        <Icon className={cn("text-gray-400 dark:text-gray-500", currentSize.icon)} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn("mb-2 font-semibold text-gray-900 dark:text-white", currentSize.title)}
      >
        {finalTitle}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={cn("mb-6 max-w-md text-gray-600 dark:text-gray-400", currentSize.description)}
      >
        {finalDescription}
      </motion.p>

      {action && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Button
            variant={action.variant || "primary"}
            onClick={action.onClick}
            size={size === "sm" ? "sm" : "default"}
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * Pre-built empty state components for common scenarios
 */
export const EmptyStateComponents = {
  /**
   * Search results empty state
   */
  SearchResults: ({ query, onClearSearch }: { query: string; onClearSearch: () => void }) => (
    <EmptyState
      variant="search"
      title={`Nenhum resultado para "${query}"`}
      action={{
        label: "Limpar busca",
        onClick: onClearSearch,
        variant: "secondary",
      }}
    />
  ),

  /**
   * Timeline empty state for new users
   */
  Timeline: ({ onCreatePost }: { onCreatePost: () => void }) => (
    <EmptyState
      variant="posts"
      title="Sua timeline está vazia"
      description="Siga pessoas interessantes ou crie seu primeiro post para começar!"
      action={{
        label: "Criar primeiro post",
        onClick: onCreatePost,
      }}
    />
  ),

  /**
   * Chat list empty state
   */
  ChatList: ({ onStartChat }: { onStartChat: () => void }) => (
    <EmptyState
      variant="messages"
      title="Nenhuma conversa ainda"
      description="Encontre pessoas interessantes e comece a conversar!"
      action={{
        label: "Iniciar conversa",
        onClick: onStartChat,
      }}
    />
  ),

  /**
   * Profile followers empty state
   */
  Followers: ({ isOwnProfile }: { isOwnProfile: boolean }) => (
    <EmptyState
      variant="followers"
      title={isOwnProfile ? "Você ainda não tem seguidores" : "Nenhum seguidor"}
      description={
        isOwnProfile
          ? "Compartilhe conteúdo interessante para atrair seguidores!"
          : "Esta pessoa ainda não tem seguidores."
      }
    />
  ),
}
