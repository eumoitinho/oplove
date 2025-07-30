"use client"

import { useState } from "react"
import { Camera, Video, Mic, BarChart2, Globe, Users, Lock, ChevronDown } from "lucide-react"
import { UserAvatar } from "@/components/common/UserAvatar"
import { PaywallTooltip } from "@/components/common/PaywallTooltip"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"

interface CreatePostProps {
  onSuccess?: (post: any) => void
}

type Visibility = "public" | "friends" | "private"

export function CreatePost({ onSuccess }: CreatePostProps) {
  const { user } = useAuth()
  const features = usePremiumFeatures()
  const [postContent, setPostContent] = useState("")
  const [postVisibility, setPostVisibility] = useState<Visibility>("public")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) return null

  const handlePublish = async () => {
    if (!postContent.trim()) return

    setIsSubmitting(true)

    try {
      const postData = {
        content: postContent.trim(),
        visibility: postVisibility,
      }

      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar post')
      }

      // Reset form
      setPostContent("")
      setPostVisibility("public")

      onSuccess?.(result.data)
    } catch (error) {
      console.error("Error creating post:", error)
      alert(error instanceof Error ? error.message : 'Erro ao criar post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getVisibilityIcon = () => {
    switch (postVisibility) {
      case "public":
        return <Globe className="w-3 h-3" />
      case "friends":
        return <Users className="w-3 h-3" />
      case "private":
        return <Lock className="w-3 h-3" />
    }
  }

  const getVisibilityLabel = () => {
    switch (postVisibility) {
      case "public":
        return "Público"
      case "friends":
        return "Amigos"
      case "private":
        return "Privado"
    }
  }

  return (
    <div
      className="mb-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 animate-slide-in-from-top"
    >
      <div className="flex gap-4">
        <UserAvatar 
          user={user}
          size="lg" 
          showPlanBadge={false}
          className="flex-shrink-0"
        />
        <div className="flex-grow">
          <Textarea
            placeholder="O que está acontecendo? ✨"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="bg-transparent border-none text-lg p-0 focus-visible:ring-0 placeholder:text-gray-500 dark:placeholder:text-white/50 resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              <PaywallTooltip feature="upload_images">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300 rounded-full"
                >
                  <Camera className="w-5 h-5" />
                </Button>
              </PaywallTooltip>
              <PaywallTooltip feature="upload_images" customTitle="Upload de Vídeo" customDescription="Compartilhe vídeos incríveis nos seus posts" requiredPlan="gold">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-300 rounded-full"
                >
                  <Video className="w-5 h-5" />
                </Button>
              </PaywallTooltip>
              <PaywallTooltip feature="upload_images" customTitle="Áudio" customDescription="Adicione áudios aos seus posts" requiredPlan="gold">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-300 rounded-full"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              </PaywallTooltip>
              <PaywallTooltip feature="polls">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all duration-300 rounded-full"
                >
                  <BarChart2 className="w-5 h-5" />
                </Button>
              </PaywallTooltip>
            </div>
            <div className="flex items-center gap-3">
              {/* Seletor de Visibilidade */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-full px-3 py-2 text-sm text-gray-700 dark:text-white/80 hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                  >
                    {getVisibilityIcon()}
                    <span className="hidden sm:inline">{getVisibilityLabel()}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-2"
                >
                  <DropdownMenuItem
                    onClick={() => setPostVisibility("public")}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <Globe className="w-4 h-4" />
                    Público
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPostVisibility("friends")}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <Users className="w-4 h-4" />
                    Amigos
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPostVisibility("private")}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <Lock className="w-4 h-4" />
                    Privado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handlePublish}
                disabled={!postContent.trim() || isSubmitting}
                className="rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                {isSubmitting ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
