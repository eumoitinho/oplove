"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface PostPollProps {
  poll: {
    id: string
    question: string
    options: PollOption[]
    expires_at: string
    user_vote?: string
  }
  canVote: boolean
  onVote?: (pollId: string, optionId: string) => void
  className?: string
}

export function PostPoll({ poll, canVote, onVote, className }: PostPollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.user_vote || null)
  const [isVoting, setIsVoting] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)
  const isExpired = new Date(poll.expires_at) < new Date()
  const hasVoted = !!selectedOption

  // Update time left
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date()
      const expiresAt = new Date(poll.expires_at)

      if (expiresAt > now) {
        setTimeLeft(formatDistanceToNow(expiresAt, { locale: ptBR }))
      } else {
        setTimeLeft("Encerrada")
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [poll.expires_at])

  const handleVote = async (optionId: string) => {
    if (!canVote || hasVoted || isExpired || !onVote) return

    setIsVoting(true)
    setSelectedOption(optionId)

    try {
      await onVote(poll.id, optionId)
    } catch (error) {
      setSelectedOption(null)
    } finally {
      setIsVoting(false)
    }
  }

  const getOptionPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
  }

  return (
    <div className={cn("space-y-4 p-4 bg-gray-50 rounded-lg", className)}>
      {/* Poll Question */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">{poll.question}</h4>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>
              {totalVotes} {totalVotes === 1 ? "voto" : "votos"}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Poll Options */}
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage = getOptionPercentage(option.votes)
          const isSelected = selectedOption === option.id
          const showResults = hasVoted || isExpired

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {showResults ? (
                // Results View
                <div className="relative">
                  <div
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                      isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white",
                    )}
                  >
                    <span className="font-medium text-gray-900 relative z-10">{option.text}</span>
                    <span className="text-sm font-semibold text-gray-700 relative z-10">{percentage}%</span>
                  </div>

                  {/* Progress Bar Background */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-lg transition-all duration-500",
                      isSelected ? "bg-purple-100" : "bg-gray-100",
                    )}
                    style={{
                      width: `${percentage}%`,
                      opacity: 0.3,
                    }}
                  />
                </div>
              ) : (
                // Voting View
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start p-3 h-auto text-left transition-all duration-200",
                    "hover:border-purple-500 hover:bg-purple-50",
                    isVoting && "opacity-50 cursor-not-allowed",
                  )}
                  onClick={() => handleVote(option.id)}
                  disabled={!canVote || isExpired || isVoting}
                >
                  {option.text}
                </Button>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Poll Status */}
      {!canVote && !hasVoted && (
        <p className="text-sm text-gray-500 text-center">Faça login para votar nesta enquete</p>
      )}

      {isExpired && <p className="text-sm text-gray-500 text-center">Esta enquete foi encerrada</p>}
    </div>
  )
}
