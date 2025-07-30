"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Grid3X3, 
  Heart, 
  MessageSquare, 
  Users, 
  Camera,
  Lock,
  Crown
} from "lucide-react"

interface ProfileTabsProps {
  user: any
  isOwnProfile: boolean
  posts?: any[]
  media?: any[]
  likes?: any[]
}

export function ProfileTabs({ user, isOwnProfile, posts = [], media = [], likes = [] }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("posts")

  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: Grid3X3,
      count: posts.length,
      content: <PostsTab posts={posts} isOwnProfile={isOwnProfile} />
    },
    {
      id: "media",
      label: "Mídia",
      icon: Camera,
      count: media.length,
      content: <MediaTab media={media} isOwnProfile={isOwnProfile} />
    },
    ...(isOwnProfile ? [{
      id: "likes",
      label: "Curtidas",
      icon: Heart,
      count: likes.length,
      content: <LikesTab likes={likes} />
    }] : [])
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className="flex items-center gap-2"
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <Badge variant="secondary" className="ml-1">
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

function PostsTab({ posts, isOwnProfile }: { posts: any[], isOwnProfile: boolean }) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Grid3X3 className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isOwnProfile ? "Você ainda não fez nenhum post" : "Nenhum post ainda"}
          </h3>
          <p className="text-muted-foreground text-center">
            {isOwnProfile 
              ? "Compartilhe seus momentos e pensamentos com sua comunidade"
              : "Este usuário ainda não compartilhou nenhum post"
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

function MediaTab({ media, isOwnProfile }: { media: any[], isOwnProfile: boolean }) {
  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Camera className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isOwnProfile ? "Nenhuma mídia compartilhada" : "Nenhuma mídia"}
          </h3>
          <p className="text-muted-foreground text-center">
            {isOwnProfile 
              ? "Compartilhe fotos e vídeos para aparecerem aqui"
              : "Este usuário ainda não compartilhou mídia"
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {media.map((item) => (
        <MediaCard key={item.id} media={item} />
      ))}
    </div>
  )
}

function LikesTab({ likes }: { likes: any[] }) {
  if (likes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma curtida ainda</h3>
          <p className="text-muted-foreground text-center">
            Os posts que você curtir aparecerão aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {likes.map((like) => (
        <PostCard key={like.id} post={like.post} />
      ))}
    </div>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="aspect-square bg-gray-100 dark:bg-gray-800">
            <img 
              src={post.media_urls[0]} 
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <p className="text-sm line-clamp-3">{post.content}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{post.stats?.likes_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{post.stats?.comments_count || 0}</span>
            </div>
            {post.is_premium_content && (
              <Crown className="w-4 h-4 text-yellow-500" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MediaCard({ media }: { media: any }) {
  return (
    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      <img 
        src={media.url} 
        alt=""
        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
      />
    </div>
  )
}