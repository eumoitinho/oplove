"use client"

import { useState } from "react"
import { Image as ImageIcon, Video, BarChart, Mic, Calendar } from "lucide-react"
import { UserAvatar } from "@/components/common/UserAvatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface CreatePostBoxProps {
  onSuccess?: (post: any) => void
  className?: string
}

export function CreatePostBox({ onSuccess, className }: CreatePostBoxProps) {
  const { user } = useAuth()
  const [postContent, setPostContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) return null

  const handlePublish = async () => {
    if (!postContent.trim()) return
    
    setIsSubmitting(true)
    try {
      // Post creation logic here
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postContent,
          visibility: 'public'
        }),
      })

      if (response.ok) {
        const newPost = await response.json()
        setPostContent("")
        onSuccess?.(newPost)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn(
      "border-y border-[#363f54] py-4 px-4",
      className
    )}>
      <div className="flex gap-3">
        {/* User Avatar */}
        <UserAvatar 
          user={user}
          size="lg"
          showPlanBadge={false}
          className="flex-shrink-0"
        />

        {/* Post Input Area */}
        <div className="flex-1">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Poste alguma coisa gostosa, rsrs."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full bg-transparent text-[#8899a6] text-xl placeholder:text-[#8899a6] border-none outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-[#e69aff] hover:text-[#e69aff]/80 transition-colors">
                <ImageIcon className="w-6 h-6" />
              </button>
              <button className="text-[#131927] hover:text-[#131927]/80 transition-colors">
                <Video className="w-6 h-6" />
              </button>
              <button className="text-[#131927] hover:text-[#131927]/80 transition-colors">
                <BarChart className="w-6 h-6" />
              </button>
              <button className="text-[#e69aff] hover:text-[#e69aff]/80 transition-colors">
                <Mic className="w-6 h-6" />
              </button>
              <button className="text-[#131927] hover:text-[#131927]/80 transition-colors">
                <Calendar className="w-6 h-6" />
              </button>
            </div>

            {/* Post Button */}
            <Button
              onClick={handlePublish}
              disabled={!postContent.trim() || isSubmitting}
              className={cn(
                "bg-gradient-to-b from-[#e69aff] via-[#ff4bc9] via-[54.687%] to-[#ff5f5f]",
                "hover:opacity-90 text-white font-bold px-6 py-2 rounded-full",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Postar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-8 border-t border-[#363f54] pt-4">
        <button className="relative text-white font-medium">
          Para você
          <div className="absolute -bottom-[17px] left-0 right-0 h-1 bg-gradient-to-r from-[#e69aff] via-[#ff4bc9] to-[#ff5f5f] rounded-full" />
        </button>
        <button className="text-[#9099af] hover:text-white/80 transition-colors">
          Seguindo
        </button>
      </div>
    </div>
  )
}