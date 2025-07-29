"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Smile, Mic, X, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useChatStore } from "@/lib/stores/chat-store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { VoiceRecorder } from "./VoiceRecorder"
import { MediaUploader } from "../create/MediaUploader"
import EmojiPicker from "emoji-picker-react"
import type { Conversation } from "@/types/chat"

interface MessageInputProps {
  conversation: Conversation
  disabled?: boolean
}

export function MessageInput({ conversation, disabled = false }: MessageInputProps) {
  const { user } = useAuthStore()
  const { sendMessage, updateTypingStatus, canSendMessage, getMessageLimit } = useChatStore()

  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMediaUploader, setShowMediaUploader] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const messagePermissions = canSendMessage(conversation.id)
  const messageLimit = getMessageLimit()

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleInputChange = (value: string) => {
    setMessage(value)

    // Handle typing indicator
    if (!isTyping && value.trim()) {
      setIsTyping(true)
      updateTypingStatus(conversation.id, true)
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      updateTypingStatus(conversation.id, false)
    }, 1000)
  }

  const handleSendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || isSending || !messagePermissions.canSend) {
      return
    }

    setIsSending(true)
    try {
      await sendMessage({
        conversation_id: conversation.id,
        content: message.trim(),
        type: attachments.length > 0 ? "media" : "text",
        attachments,
      })

      setMessage("")
      setAttachments([])
      setIsTyping(false)
      updateTypingStatus(conversation.id, false)

      // Focus back to input
      textareaRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiSelect = (emojiData: any) => {
    const emoji = emojiData.emoji
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newMessage = message.slice(0, start) + emoji + message.slice(end)
      setMessage(newMessage)

      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length
        textarea.focus()
      }, 0)
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const canUseFeature = (feature: string) => {
    switch (feature) {
      case "media":
        return user?.premium_type !== "free"
      case "voice":
        return user?.premium_type === "gold" || user?.premium_type === "diamond" || user?.premium_type === "couple"
      case "location":
        return user?.premium_type === "gold" || user?.premium_type === "diamond" || user?.premium_type === "couple"
      default:
        return true
    }
  }

  if (disabled || !messagePermissions.canSend) {
    return (
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{messagePermissions.reason || "Não é possível enviar mensagens"}</span>
        </div>
        {user?.premium_type === "free" && (
          <div className="mt-2 text-center">
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Upgrade para Premium
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Message limit warning */}
      {messageLimit.hasLimit && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-800">{messageLimit.remaining} mensagens restantes hoje</span>
            {messageLimit.remaining <= 3 && (
              <Button size="sm" variant="outline">
                Verificar conta
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-gray-200"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                    <span className="text-sm truncate max-w-32">{file.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeAttachment(index)} className="h-4 w-4 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input area */}
      <div className="p-4">
        <div className="flex items-end space-x-2">
          {/* Attachment button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMediaUploader(true)}
              disabled={!canUseFeature("media")}
              className="h-10 w-10 p-0 text-gray-500 hover:text-purple-600"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={messagePermissions.canSend ? "Digite sua mensagem..." : messagePermissions.reason}
              className="min-h-[40px] max-h-32 resize-none pr-12"
              disabled={isSending}
            />

            {/* Emoji picker button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-purple-600"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Voice recorder button */}
          {canUseFeature("voice") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVoiceRecorder(true)}
              className="h-10 w-10 p-0 text-gray-500 hover:text-purple-600"
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && attachments.length === 0) || isSending}
            className="h-10 w-10 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-4 z-50"
          >
            <EmojiPicker onEmojiClick={handleEmojiSelect} theme="light" lazyLoadEmojis />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media uploader modal */}
      <AnimatePresence>
        {showMediaUploader && (
          <MediaUploader
            onClose={() => setShowMediaUploader(false)}
            onFilesSelected={(files) => {
              setAttachments((prev) => [...prev, ...files])
              setShowMediaUploader(false)
            }}
            maxFiles={5}
            acceptedTypes={["image/*", "video/*"]}
          />
        )}
      </AnimatePresence>

      {/* Voice recorder modal */}
      <AnimatePresence>
        {showVoiceRecorder && (
          <VoiceRecorder
            onClose={() => setShowVoiceRecorder(false)}
            onRecordingComplete={(audioBlob) => {
              // Handle voice message
              setShowVoiceRecorder(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
