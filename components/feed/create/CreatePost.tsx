"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageIcon, Video, BarChart3, MapPin, Smile, X, Lock, Users, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MediaUploader } from "./MediaUploader"
import { PollCreator } from "./PollCreator"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface CreatePostProps {
  onSuccess?: (post: any) => void
  className?: string
}

type PostType = "text" | "media" | "poll" | "event"
type Visibility = "public" | "followers" | "private"

const visibilityOptions = {
  public: { icon: Globe, label: "Público", description: "Todos podem ver" },
  followers: { icon: Users, label: "Seguidores", description: "Apenas seguidores" },
  private: { icon: Lock, label: "Privado", description: "Apenas você" },
}

export function CreatePost({ onSuccess, className }: CreatePostProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState<PostType>("text")
  const [visibility, setVisibility] = useState<Visibility>("public")
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [media, setMedia] = useState<File[]>([])
  const [poll, setPoll] = useState<any>(null)
  const [location, setLocation] = useState<any>(null)

  if (!user) return null

  const maxLength = user.premium_type === "free" ? 280 : user.premium_type === "gold" ? 500 : 1000

  const canUploadMedia = ["gold", "diamond", "couple"].includes(user.premium_type)
  const canCreatePoll = ["gold", "diamond", "couple"].includes(user.premium_type)
  const canUploadVideo = ["diamond", "couple"].includes(user.premium_type)
  const canAddLocation = ["gold", "diamond", "couple"].includes(user.premium_type)

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0 && !poll) return

    setIsSubmitting(true)

    try {
      // Create post logic here
      const postData = {
        content: content.trim(),
        visibility,
        media,
        poll,
        location,
        type: postType,
      }

      // API call would go here
      console.log("Creating post:", postData)

      // Reset form
      setContent("")
      setMedia([])
      setPoll(null)
      setLocation(null)
      setPostType("text")
      setIsExpanded(false)

      onSuccess?.(postData)
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFocus = () => {
    setIsExpanded(true)
  }

  const handleCancel = () => {
    setContent("")
    setMedia([])
    setPoll(null)
    setLocation(null)
    setPostType("text")
    setIsExpanded(false)
  }

  const PremiumFeatureTooltip = ({ feature }: { feature: string }) => (
    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
      {feature} disponível para usuários Gold+
    </div>
  )

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-purple-100">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.display_name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
              {user.display_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            {/* Text Input */}
            <div className="relative">
              <Textarea
                placeholder={`O que está acontecendo, ${user.display_name?.split(" ")[0]}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={handleFocus}
                className={cn(
                  "min-h-[60px] resize-none border-0 bg-transparent text-lg placeholder:text-gray-500 focus-visible:ring-0",
                  isExpanded && "min-h-[120px]",
                )}
                maxLength={maxLength}
              />

              {/* Character Count */}
              {isExpanded && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {content.length}/{maxLength}
                </div>
              )}
            </div>

            {/* Media Preview */}
            <AnimatePresence>
              {media.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <MediaUploader
                    files={media}
                    onChange={setMedia}
                    maxFiles={user.premium_type === "free" ? 0 : 5}
                    allowVideo={canUploadVideo}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Poll Preview */}
            <AnimatePresence>
              {poll && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <PollCreator poll={poll} onChange={setPoll} onRemove={() => setPoll(null)} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Location Preview */}
            <AnimatePresence>
              {location && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-2 text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{location.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation(null)}
                    className="h-auto p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Controls */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {/* Visibility Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Visibilidade:</span>
                    <Select value={visibility} onValueChange={(value: Visibility) => setVisibility(value)}>
                      <SelectTrigger className="w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(visibilityOptions).map(([key, option]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              <option.icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-gray-500">{option.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Media Button */}
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (canUploadMedia ? setPostType("media") : null)}
                          disabled={!canUploadMedia}
                          className={cn(
                            "text-purple-600 hover:text-purple-700 hover:bg-purple-50",
                            !canUploadMedia && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        {!canUploadMedia && <PremiumFeatureTooltip feature="Upload de mídia" />}
                      </div>

                      {/* Video Button */}
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!canUploadVideo}
                          className={cn(
                            "text-purple-600 hover:text-purple-700 hover:bg-purple-50",
                            !canUploadVideo && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                        {!canUploadVideo && <PremiumFeatureTooltip feature="Upload de vídeo" />}
                      </div>

                      {/* Poll Button */}
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (canCreatePoll ? setPoll({ question: "", options: ["", ""] }) : null)}
                          disabled={!canCreatePoll}
                          className={cn(
                            "text-purple-600 hover:text-purple-700 hover:bg-purple-50",
                            !canCreatePoll && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        {!canCreatePoll && <PremiumFeatureTooltip feature="Enquetes" />}
                      </div>

                      {/* Location Button */}
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!canAddLocation}
                          className={cn(
                            "text-purple-600 hover:text-purple-700 hover:bg-purple-50",
                            !canAddLocation && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                        {!canAddLocation && <PremiumFeatureTooltip feature="Localização" />}
                      </div>

                      {/* Emoji Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSubmitting}>
                        Cancelar
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        disabled={(!content.trim() && media.length === 0 && !poll) || isSubmitting}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {isSubmitting ? "Publicando..." : "Publicar"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
