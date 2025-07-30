"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { toast } from "@/lib/services/toast-service"
import { PaymentModal } from "@/components/common/PaymentModal"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface FollowButtonProps {
  userId: string
  username?: string
  isFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function FollowButton({
  userId,
  username,
  isFollowing: initialIsFollowing = false,
  onFollowChange,
  className,
  variant = "default",
  size = "default"
}: FollowButtonProps) {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Não mostrar botão se for o próprio usuário
  if (!user || user.id === userId) {
    return null
  }

  const handleFollowClick = async () => {
    // Verificar se é usuário free tentando seguir
    if (!isFollowing && features.userPlan === "free") {
      toast.error("Apenas usuários com plano Gold ou superior podem seguir outros usuários.")
      setShowPaymentModal(true)
      return
    }

    setIsLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId)

        if (error) throw error

        setIsFollowing(false)
        onFollowChange?.(false)
        
        toast.success(username ? `Você deixou de seguir @${username}` : "Você deixou de seguir este usuário")
      } else {
        // Follow
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: user.id,
            following_id: userId
          })

        if (error) {
          if (error.code === "23505") {
            // Já está seguindo
            setIsFollowing(true)
            onFollowChange?.(true)
            return
          }
          throw error
        }

        setIsFollowing(true)
        onFollowChange?.(true)
        
        toast.success(username ? `Você está seguindo @${username}` : "Você está seguindo este usuário")

        // Criar notificação para o usuário seguido
        await supabase
          .from("notifications")
          .insert({
            user_id: userId,
            type: "follow",
            title: "Novo seguidor",
            message: `@${user.username} começou a seguir você`,
            data: {
              follower_id: user.id,
              follower_username: user.username,
              follower_avatar: user.avatar_url
            }
          })
      }
    } catch (error: any) {
      console.error("Error following/unfollowing:", error)
      toast.error("Não foi possível completar a ação. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleFollowClick}
        disabled={isLoading}
        variant={isFollowing ? "outline" : variant}
        size={size}
        className={cn(
          "transition-all duration-300",
          isFollowing && "hover:border-red-500 hover:text-red-500 dark:hover:border-red-400 dark:hover:text-red-400",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFollowing ? (
          <>
            <UserMinus className="w-4 h-4 mr-2" />
            Seguindo
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Seguir
          </>
        )}
      </Button>

      {/* Payment Modal for Free Users */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan="gold"
        onSuccess={() => {
          setShowPaymentModal(false)
          // Tentar seguir novamente após upgrade
          handleFollowClick()
        }}
      />
    </>
  )
}