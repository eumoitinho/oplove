"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Star, Gem, Verified } from "lucide-react"

interface WhoToFollowCardProps {
  onViewChange?: (view: string) => void
}

const suggestedUsers = [
  {
    name: "Luna Rodriguez",
    username: "lunadesign",
    avatar: "/latina-designer.png",
    verified: true,
    plan: "Diamond" as const,
    bio: "Design Lead @techstartup • Accessibility advocate 🌟",
    mutualConnections: 12,
  },
  {
    name: "David Kim",
    username: "davidbuilds",
    avatar: "/asian-man-entrepreneur.png",
    verified: false,
    plan: "Gold" as const,
    bio: "Building startups • Design systems advocate",
    mutualConnections: 8,
  },
  {
    name: "Emma Thompson",
    username: "emmacodes",
    avatar: "/placeholder.svg",
    verified: true,
    plan: "Free" as const,
    bio: "Frontend Developer • React enthusiast • Coffee lover ☕",
    mutualConnections: 5,
  },
]

const PlanBadge = ({ plan }: { plan: "Free" | "Gold" | "Diamond" }) => {
  const planStyles = {
    Diamond: { icon: Gem, className: "plan-badge-diamond" },
    Gold: { icon: Star, className: "plan-badge-gold" },
    Free: { icon: () => null, className: "plan-badge-free" },
  }
  const { icon: Icon, className } = planStyles[plan]
  if (plan === "Free") return null
  return (
    <Badge variant="outline" className={`text-xs ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {plan}
    </Badge>
  )
}

export function WhoToFollowCard({ onViewChange }: WhoToFollowCardProps) {
  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Descubra Pessoas Incríveis</h3>
          <p className="text-sm text-gray-500 dark:text-white/60">Conecte-se com criadores em sua área</p>
        </div>
      </div>

      <div className="space-y-4">
        {suggestedUsers.map((user) => (
          <div
            key={user.username}
            className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 border border-gray-100 dark:border-white/5"
          >
            <Avatar className="w-12 h-12 ring-2 ring-gray-200 dark:ring-white/10 flex-shrink-0">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {user.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white truncate">{user.username}</span>
                {user.verified && <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                <PlanBadge plan={user.plan} />
              </div>
              <p className="text-sm text-gray-500 dark:text-white/60 mb-2">@{user.username}</p>
              <p className="text-sm text-gray-700 dark:text-white/80 mb-3 line-clamp-2">{user.bio}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-white/50">
                  {user.mutualConnections} conexões mútuas
                </span>
                <Button
                  size="sm"
                  className="rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90 px-4 py-1 hover:scale-105 transition-all duration-300"
                >
                  Seguir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        onClick={() => onViewChange?.("who-to-follow")}
        className="w-full mt-4 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-2xl transition-all duration-300"
      >
        Ver Mais Sugestões
      </Button>
    </div>
  )
}
