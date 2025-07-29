"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Video, Mic, BarChart2, Sparkles } from "lucide-react"
import { PostCard } from "./post-card"
import { PostSkeleton } from "./post-skeleton"
import { WhoToFollowCard } from "./who-to-follow-card"
import { TrendingTopicsCard } from "./trending-topics-card"
import type { Post } from "./types"

const mockPosts: Post[] = [
  {
    id: "1",
    user: {
      name: "Sarah Chen",
      username: "sarahdesigns",
      avatar: "/professional-woman-designer.png",
      verified: true,
      plan: "Diamond",
      location: "São Paulo, BR",
    },
    content:
      "Loving the new fluid layout of OpenLove! 🌊 The single-column design feels so much more natural and immersive. It's like scrolling through a beautiful story rather than navigating a rigid interface. ✨ #OpenLove #UIUX #FluidDesign",
    timestamp: "2h",
    stats: { likes: 247, comments: 34, shares: 12 },
    media: [{ type: "image", url: "/modern-portfolio-bento.png" }],
    isLiked: true,
    isSaved: true,
  },
  {
    id: "2",
    user: {
      name: "Alex Rivera",
      username: "alexcodes",
      avatar: "/young-developer-man.png",
      verified: false,
      plan: "Gold",
      location: "Rio de Janeiro, BR",
    },
    content:
      "The way OpenLove integrates 'Who to Follow' and trending topics directly into the timeline is genius! 🧠 No more context switching between different sections. Everything flows naturally. This is how social media should be designed.",
    timestamp: "4h",
    stats: { likes: 156, comments: 23, shares: 5 },
    isLiked: false,
    isSaved: false,
  },
  {
    id: "3",
    user: {
      name: "Maya Patel",
      username: "mayacreates",
      avatar: "/creative-woman-artist.png",
      verified: true,
      plan: "Free",
      location: "Belo Horizonte, BR",
    },
    content:
      "Just discovered an amazing design event through the integrated suggestions! 🎨 The organic way content and recommendations blend together makes discovery feel effortless. Found my new favorite design community here! 💜",
    timestamp: "6h",
    stats: { likes: 892, comments: 78, shares: 45 },
    media: [{ type: "video", url: "/placeholder-oww0g.png" }],
    isLiked: true,
    isSaved: false,
  },
  {
    id: "4",
    user: {
      name: "David Kim",
      username: "davidbuilds",
      avatar: "/asian-man-entrepreneur.png",
      verified: false,
      plan: "Gold",
      location: "Brasília, BR",
    },
    content:
      "The responsive design of this new layout is incredible! 📱💻 From mobile to desktop, everything adapts beautifully. The header navigation is clean and the single column keeps me focused on what matters most - the content and connections.",
    timestamp: "8h",
    stats: { likes: 445, comments: 56, shares: 23 },
    isLiked: false,
    isSaved: true,
  },
]

export function FluidTimeline() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [postContent, setPostContent] = useState("")

  // Simulate loading posts
  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(mockPosts)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handlePublish = () => {
    if (postContent.trim()) {
      // Here you would typically send the post to your backend
      console.log("Publishing post:", postContent)
      setPostContent("")
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12">
      {/* Post Creation Area */}
      <div className="mb-8 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 animate-slide-in-from-top">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12 ring-2 ring-gray-200 dark:ring-white/10 flex-shrink-0">
            <AvatarImage src="/professional-woman-designer.png" />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">SC</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <Textarea
              placeholder="What's happening in your world? ✨"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="bg-transparent border-none text-lg p-0 focus-visible:ring-0 placeholder:text-gray-500 dark:placeholder:text-white/50 resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300 rounded-full"
                >
                  <Camera className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-300 rounded-full"
                >
                  <Video className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-300 rounded-full"
                >
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all duration-300 rounded-full"
                >
                  <BarChart2 className="w-5 h-5" />
                </Button>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-lg">
                <Button
                  onClick={handlePublish}
                  disabled={!postContent.trim()}
                  className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="space-y-6">
        {isLoading
          ? // Show skeletons while loading
            Array.from({ length: 3 }).map((_, index) => <PostSkeleton key={index} />)
          : posts.map((post, index) => {
              const content = []

              // Add post
              content.push(
                <div key={post.id} className="animate-slide-in-from-top" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PostCard post={post} />
                </div>,
              )

              // Add integrated content after specific posts
              if (index === 1) {
                content.push(
                  <div
                    key="who-to-follow"
                    className="animate-slide-in-from-top"
                    style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                  >
                    <WhoToFollowCard />
                  </div>,
                )
              }

              if (index === 2) {
                content.push(
                  <div
                    key="trending-topics"
                    className="animate-slide-in-from-top"
                    style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                  >
                    <TrendingTopicsCard />
                  </div>,
                )
              }

              return content
            })}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-12">
        <Button
          variant="outline"
          className="rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-purple-300 dark:hover:border-purple-400/30 transition-all duration-300 px-8 py-3"
        >
          Load More Stories
        </Button>
      </div>
    </div>
  )
}
