"use client"

import { useState, useEffect } from "react"
import { Check, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useChatStore } from "@/lib/stores/chat-store"
import { cn } from "@/lib/utils"
import type { MessageReadReceipt } from "@/types/chat"

interface ReadReceiptsProps {
  messageId: string
  className?: string
}

export function ReadReceipts({ messageId, className }: ReadReceiptsProps) {
  const { getMessageReadReceipts } = useChatStore()
  const [receipts, setReceipts] = useState<MessageReadReceipt[]>([])

  useEffect(() => {
    const loadReceipts = async () => {
      try {
        const data = await getMessageReadReceipts(messageId)
        setReceipts(data)
      } catch (error) {
        console.error("Error loading read receipts:", error)
      }
    }

    loadReceipts()
  }, [messageId, getMessageReadReceipts])

  if (receipts.length === 0) {
    return <Check className={cn("h-3 w-3 text-gray-400", className)} />
  }

  const readReceipts = receipts.filter((r) => r.read_at)
  const deliveredReceipts = receipts.filter((r) => r.delivered_at && !r.read_at)

  if (readReceipts.length > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={cn("flex items-center", className)}>
              {readReceipts.length === 1 ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <div className="flex -space-x-1">
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                  {readReceipts.slice(0, 3).map((receipt, index) => (
                    <Avatar key={receipt.user_id} className="h-3 w-3 border border-white">
                      <AvatarImage src={receipt.user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-500 text-white text-[8px]">
                        {receipt.user.full_name?.charAt(0) || receipt.user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {readReceipts.length > 3 && (
                    <div className="h-3 w-3 bg-gray-300 rounded-full flex items-center justify-center text-[6px] text-gray-600">
                      +{readReceipts.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium text-xs">Lida por:</p>
              {readReceipts.slice(0, 5).map((receipt) => (
                <p key={receipt.user_id} className="text-xs">
                  {receipt.user.full_name || receipt.user.username}
                </p>
              ))}
              {readReceipts.length > 5 && (
                <p className="text-xs text-gray-500">e mais {readReceipts.length - 5} pessoas</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (deliveredReceipts.length > 0) {
    return <CheckCheck className={cn("h-3 w-3 text-gray-400", className)} />
  }

  return <Check className={cn("h-3 w-3 text-gray-400", className)} />
}
