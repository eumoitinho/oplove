"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Hash, Calendar, MapPin } from "lucide-react"

interface TrendingTopicsCardProps {
  onViewChange?: (view: string) => void
}

const trendingData = [
  {
    type: "hashtag" as const,
    category: "Technology",
    title: "#ReactJS",
    posts: "15.2K posts",
    trend: "+12%",
  },
  {
    type: "hashtag" as const,
    category: "Design",
    title: "#UIUX",
    posts: "22.7K posts",
    trend: "+8%",
  },
  {
    type: "event" as const,
    category: "Event",
    title: "Web Summit Rio",
    posts: "8.9K posts",
    location: "Rio de Janeiro, BR",
  },
  {
    type: "hashtag" as const,
    category: "Lifestyle",
    title: "#WorkFromHome",
    posts: "45.1K posts",
    trend: "+25%",
  },
]

export function TrendingTopicsCard({ onViewChange }: TrendingTopicsCardProps) {
  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">O Que Está Em Alta</h3>
          <p className="text-sm text-gray-500 dark:text-white/60">Tópicos populares agora</p>
        </div>
      </div>

      <div className="space-y-3">
        {trendingData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 border border-gray-100 dark:border-white/5 cursor-pointer group"
          >
            <div className="flex items-center gap-3 flex-grow min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 flex items-center justify-center flex-shrink-0">
                {item.type === "hashtag" ? (
                  <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wide">
                    {item.category}
                  </span>
                  {item.trend && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-400/30"
                    >
                      {item.trend}
                    </Badge>
                  )}
                </div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60">
                  <span>{item.posts}</span>
                  {item.location && (
                    <>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{item.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        onClick={() => onViewChange?.("trending-topics")}
        className="w-full mt-4 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-2xl transition-all duration-300"
      >
        Explorar Todas as Tendências
      </Button>
    </div>
  )
}
