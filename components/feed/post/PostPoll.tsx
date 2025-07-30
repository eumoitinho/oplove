"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface Poll {
  id: string
  question: string
  options: PollOption[]
  total_votes: number
  expires_at: string
  multiple_choice: boolean
  user_has_voted: boolean
  user_votes?: string[] // option IDs the user voted for
}

interface PollOption {
  id: string
  text: string
  votes_count: number
  percentage?: number
}

interface PostPollProps {
  poll: Poll
  canVote: boolean
  onVote: (pollId: string, optionId: string) => Promise<void>
  className?: string
}

export function PostPoll({ poll, canVote, onVote, className }: PostPollProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(poll.user_votes || [])
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(poll.user_has_voted)

  const isExpired = new Date(poll.expires_at) < new Date()
  const showResults = hasVoted || isExpired || !canVote

  const handleOptionClick = (optionId: string) => {
    if (!canVote || hasVoted || isExpired) return

    if (poll.multiple_choice) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const handleVote = async () => {
    if (selectedOptions.length === 0) return
    
    setIsVoting(true)
    try {
      // Vote for each selected option
      for (const optionId of selectedOptions) {
        await onVote(poll.id, optionId)
      }
      setHasVoted(true)
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setIsVoting(false)
    }
  }

  const formatTimeLeft = () => {
    const now = new Date()
    const expires = new Date(poll.expires_at)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return "Encerrada"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`
    
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes} minuto${minutes > 1 ? 's' : ''} restante${minutes > 1 ? 's' : ''}`
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white">
        {poll.question}
      </h3>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id)
          const votedForThis = poll.user_votes?.includes(option.id)
          const percentage = poll.total_votes > 0 
            ? Math.round((option.votes_count / poll.total_votes) * 100)
            : 0

          return (
            <div
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={cn(
                "relative rounded-lg border transition-all",
                showResults
                  ? "border-gray-200 dark:border-gray-700"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer",
                isSelected && !showResults && "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-950/20"
              )}
            >
              {showResults ? (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-medium",
                      votedForThis && "text-purple-600 dark:text-purple-400"
                    )}>
                      {option.text}
                    </span>
                    <div className="flex items-center gap-2">
                      {votedForThis && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                      <span className="text-sm font-medium">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.votes_count} {option.votes_count === 1 ? 'voto' : 'votos'}
                  </span>
                </div>
              ) : (
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {poll.total_votes} {poll.total_votes === 1 ? 'voto' : 'votos'} · {formatTimeLeft()}
        </span>
        
        {!showResults && selectedOptions.length > 0 && (
          <Button
            size="sm"
            onClick={handleVote}
            disabled={isVoting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isVoting ? "Votando..." : "Votar"}
          </Button>
        )}
      </div>

      {poll.multiple_choice && !showResults && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Você pode escolher múltiplas opções
        </p>
      )}
    </div>
  )
}