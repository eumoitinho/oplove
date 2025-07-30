"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Grid, List, Search, Plus, TrendingUp, Eye, Heart, Share2, MoreHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContentItem {
  id: string
  title: string
  description: string
  type: "image" | "video" | "audio" | "document" | "course"
  thumbnail: string
  price: number
  isPaid: boolean
  isExclusive: boolean
  createdAt: string
  stats: {
    views: number
    likes: number
    comments: number
    purchases: number
  }
  tags: string[]
  duration?: string
  size?: string
}

interface ContentGridProps {
  businessId: string
  isOwner?: boolean
  onCreateContent?: () => void
}

const contentTypeIcons = {
  image: "🖼️",
  video: "🎥",
  audio: "🎵",
  document: "📄",
  course: "🎓",
}

const contentTypeColors = {
  image: "bg-blue-500",
  video: "bg-red-500",
  audio: "bg-green-500",
  document: "bg-yellow-500",
  course: "bg-purple-500",
}

export function ContentGrid({ businessId, isOwner = false, onCreateContent }: ContentGridProps) {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterType, setFilterType] = useState("all")

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockContent: ContentItem[] = [
      {
        id: "1",
        title: "Premium Photography Course",
        description: "Learn professional photography techniques from industry experts",
        type: "course",
        thumbnail: "/photography-course.png",
        price: 99.99,
        isPaid: true,
        isExclusive: true,
        createdAt: "2024-01-15",
        stats: { views: 1250, likes: 89, comments: 23, purchases: 45 },
        tags: ["photography", "course", "professional"],
        duration: "4h 30m",
      },
      {
        id: "2",
        title: "Behind the Scenes Video",
        description: "Exclusive behind-the-scenes content from our latest shoot",
        type: "video",
        thumbnail: "/behind-the-scenes-video.png",
        price: 9.99,
        isPaid: true,
        isExclusive: false,
        createdAt: "2024-01-20",
        stats: { views: 890, likes: 67, comments: 12, purchases: 78 },
        tags: ["video", "exclusive", "bts"],
        duration: "15m",
      },
      {
        id: "3",
        title: "Free Sample Pack",
        description: "High-quality audio samples for your projects",
        type: "audio",
        thumbnail: "/audio-samples.png",
        price: 0,
        isPaid: false,
        isExclusive: false,
        createdAt: "2024-01-25",
        stats: { views: 2340, likes: 156, comments: 34, purchases: 234 },
        tags: ["audio", "free", "samples"],
        size: "45 MB",
      },
    ]

    setTimeout(() => {
      setContent(mockContent)
      setLoading(false)
    }, 1000)
  }, [businessId])

  const filteredContent = content
    .filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "popular":
          return b.stats.views - a.stats.views
        case "price-high":
          return b.price - a.price
        case "price-low":
          return a.price - b.price
        default:
          return 0
      }
    })

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`
  }

  const formatStats = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Library</h2>
          <p className="text-gray-600">{content.length} items available</p>
        </div>

        {isOwner && (
          <Button
            onClick={onCreateContent}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="course">Courses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredContent.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Content Type Badge */}
                    <Badge className={`absolute top-2 left-2 ${contentTypeColors[item.type]} text-white`}>
                      {contentTypeIcons[item.type]} {item.type}
                    </Badge>

                    {/* Exclusive Badge */}
                    {item.isExclusive && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">Exclusive</Badge>
                    )}

                    {/* Price */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatStats(item.stats.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatStats(item.stats.likes)}
                          </span>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Compartilhar
                            </DropdownMenuItem>
                            {isOwner && (
                              <>
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredContent.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatPrice(item.price)}</div>
                            <div className="text-sm text-gray-500">{item.duration || item.size}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge className={`${contentTypeColors[item.type]} text-white`}>
                              {contentTypeIcons[item.type]} {item.type}
                            </Badge>
                            {item.isExclusive && <Badge className="bg-yellow-500 text-white">Exclusive</Badge>}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatStats(item.stats.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {formatStats(item.stats.likes)}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {formatStats(item.stats.purchases)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Grid className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterType !== "all"
              ? "Try adjusting your search or filters"
              : "Start by creating your first piece of content"}
          </p>
          {isOwner && !searchQuery && filterType === "all" && (
            <Button
              onClick={onCreateContent}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
