"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Verified, Play } from "lucide-react"

interface Post {
  id: string
  user: {
    name: string
    username: string
    avatar: string
    verified: boolean
    bio?: string
  }
  content: string
  timestamp: string
  likes: number
  retweets: number
  comments: number
  media?: {
    type: "image" | "video"
    url: string
    alt?: string
  }[]
  isLiked: boolean
  isRetweeted: boolean
  isBookmarked: boolean
}

const mockPosts: Post[] = [
  {
    id: "1",
    user: {
      name: "Sarah Chen",
      username: "sarahdesigns",
      avatar: "/professional-woman-designer.png",
      verified: true,
      bio: "UI/UX Designer at @lunchbox • Creating beautiful bento grids",
    },
    content:
      "Just launched my new portfolio using @lunchbox's bento grid system! The responsive design is absolutely stunning and took me less than 30 minutes to set up. This is the future of web design! 🚀✨",
    timestamp: "2h",
    likes: 247,
    retweets: 89,
    comments: 34,
    media: [
      {
        type: "image",
        url: "/modern-portfolio-bento.png",
        alt: "Beautiful bento grid portfolio layout",
      },
    ],
    isLiked: true,
    isRetweeted: false,
    isBookmarked: true,
  },
  {
    id: "2",
    user: {
      name: "Alex Rivera",
      username: "alexcodes",
      avatar: "/young-developer-man.png",
      verified: false,
      bio: "Full-stack developer • Building the next big thing",
    },
    content:
      "Hot take: Bento grids are not just a design trend, they're the evolution of how we consume content. The way @lunchbox makes it accessible to everyone is game-changing. No more wrestling with CSS Grid! 💪",
    timestamp: "4h",
    likes: 156,
    retweets: 67,
    comments: 23,
    isLiked: false,
    isRetweeted: true,
    isBookmarked: false,
  },
  {
    id: "3",
    user: {
      name: "Maya Patel",
      username: "mayacreates",
      avatar: "/creative-woman-artist.png",
      verified: true,
      bio: "Creative Director • Storyteller • Coffee enthusiast ☕",
    },
    content:
      "Behind the scenes of my latest project! Used @lunchbox to create this interactive story layout. The drag-and-drop interface is so intuitive, even my non-designer friends can use it. This is what democratizing design looks like! 🎨",
    timestamp: "6h",
    likes: 892,
    retweets: 234,
    comments: 78,
    media: [
      {
        type: "video",
        url: "/placeholder-oww0g.png",
        alt: "Behind the scenes creative process",
      },
    ],
    isLiked: true,
    isRetweeted: false,
    isBookmarked: true,
  },
  {
    id: "4",
    user: {
      name: "David Kim",
      username: "davidbuilds",
      avatar: "/asian-man-entrepreneur.png",
      verified: false,
      bio: "Building startups • Design systems advocate",
    },
    content:
      "Just migrated our entire company blog to a bento grid layout using @lunchbox. The engagement metrics are through the roof! 📈 Our readers are spending 3x more time on each post. Sometimes the best UX improvements are the ones users don't even notice.",
    timestamp: "8h",
    likes: 445,
    retweets: 123,
    comments: 56,
    isLiked: false,
    isRetweeted: false,
    isBookmarked: false,
  },
  {
    id: "5",
    user: {
      name: "Luna Rodriguez",
      username: "lunadesign",
      avatar: "/latina-designer.png",
      verified: true,
      bio: "Design Lead @techstartup • Accessibility advocate 🌟",
    },
    content:
      "Accessibility update: @lunchbox's new keyboard navigation for bento grids is *chef's kiss* 👌 Finally, a design tool that doesn't forget about users with disabilities. This is how you build inclusive products from the ground up. More companies should take notes! ♿✨",
    timestamp: "12h",
    likes: 678,
    retweets: 189,
    comments: 92,
    isLiked: true,
    isRetweeted: true,
    isBookmarked: true,
  },
]

export function Timeline() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleRetweet = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isRetweeted: !post.isRetweeted,
              retweets: post.isRetweeted ? post.retweets - 1 : post.retweets + 1,
            }
          : post,
      ),
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Timeline Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-gray-200 dark:border-white/10 p-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline</h1>
          <Badge
            variant="outline"
            className="border-purple-300 dark:border-purple-400/30 text-purple-600 dark:text-purple-400"
          >
            Live Feed
          </Badge>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/90 dark:hover:bg-white/10 hover:border-purple-300 dark:hover:border-purple-400/30 hover:shadow-lg group"
          >
            {/* Post Header */}
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="w-12 h-12 ring-2 ring-gray-200 dark:ring-white/10 group-hover:ring-purple-300 dark:group-hover:ring-purple-400/30 transition-all duration-300">
                <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {post.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{post.user.name}</h3>
                  {post.user.verified && <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                  <span className="text-gray-500 dark:text-white/50 text-sm truncate">@{post.user.username}</span>
                  <span className="text-gray-400 dark:text-white/40 text-sm">•</span>
                  <span className="text-gray-500 dark:text-white/50 text-sm">{post.timestamp}</span>
                </div>
                {post.user.bio && (
                  <p className="text-sm text-gray-600 dark:text-white/60 mt-1 line-clamp-1">{post.user.bio}</p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                {post.media.map((item, index) => (
                  <div key={index} className="relative group/media">
                    {item.type === "image" ? (
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.alt || "Post media"}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover/media:scale-105"
                      />
                    ) : (
                      <div className="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <img
                          src={item.url || "/placeholder.svg"}
                          alt={item.alt || "Video thumbnail"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-black/90 flex items-center justify-center backdrop-blur-sm">
                            <Play className="w-6 h-6 text-gray-900 dark:text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-6">
                {/* Comments */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 dark:text-white/50 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-300 group/btn"
                >
                  <MessageCircle className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span className="text-sm">{formatNumber(post.comments)}</span>
                </Button>

                {/* Retweets */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRetweet(post.id)}
                  className={`text-gray-500 dark:text-white/50 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-300 group/btn ${
                    post.isRetweeted ? "text-green-500 dark:text-green-400" : ""
                  }`}
                >
                  <Repeat2
                    className={`w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300 ${
                      post.isRetweeted ? "scale-110" : ""
                    }`}
                  />
                  <span className="text-sm">{formatNumber(post.retweets)}</span>
                </Button>

                {/* Likes */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`text-gray-500 dark:text-white/50 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 group/btn ${
                    post.isLiked ? "text-red-500 dark:text-red-400" : ""
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300 ${
                      post.isLiked ? "fill-current scale-110" : ""
                    }`}
                  />
                  <span className="text-sm">{formatNumber(post.likes)}</span>
                </Button>
              </div>

              {/* Share */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 dark:text-white/50 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300 group/btn"
              >
                <Share className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-8 mb-12">
        <Button
          variant="outline"
          className="border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-purple-300 dark:hover:border-purple-400/30 transition-all duration-300 bg-transparent"
        >
          Load More Posts
        </Button>
      </div>
    </div>
  )
}
