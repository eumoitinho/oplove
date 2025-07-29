"use client"

import type React from "react"

import { useState } from "react"
import { Camera, MapPin, Clock, Star, Shield, Edit3, Share2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

interface BusinessHeaderProps {
  business: {
    id: string
    name: string
    type: "venue" | "creator" | "service" | "event" | "brand" | "influencer"
    avatar: string
    cover: string
    description: string
    location: string
    rating: number
    reviewCount: number
    isVerified: boolean
    isOpen: boolean
    followers: number
    following: number
    posts: number
  }
  isOwner?: boolean
  onEdit?: () => void
  onFollow?: () => void
  onMessage?: () => void
}

const businessTypeLabels = {
  venue: "Local Business",
  creator: "Content Creator",
  service: "Service Provider",
  event: "Event Organizer",
  brand: "Brand",
  influencer: "Influencer",
}

const businessTypeColors = {
  venue: "bg-blue-500",
  creator: "bg-purple-500",
  service: "bg-green-500",
  event: "bg-orange-500",
  brand: "bg-red-500",
  influencer: "bg-pink-500",
}

export function BusinessHeader({ business, isOwner = false, onEdit, onFollow, onMessage }: BusinessHeaderProps) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [coverImageLoading, setCoverImageLoading] = useState(false)

  const handleFollow = async () => {
    if (!user) return
    setIsFollowing(!isFollowing)
    onFollow?.()
  }

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCoverImageLoading(true)
    // Upload logic here
    setTimeout(() => setCoverImageLoading(false), 2000)
  }

  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        {business.cover && (
          <img
            src={business.cover || "/placeholder.svg"}
            alt={`${business.name} cover`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Cover Upload (Owner Only) */}
        {isOwner && (
          <div className="absolute top-4 right-4">
            <label htmlFor="cover-upload">
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white border-0"
                disabled={coverImageLoading}
              >
                <Camera className="w-4 h-4 mr-2" />
                {coverImageLoading ? "Uploading..." : "Change Cover"}
              </Button>
            </label>
            <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>
        )}

        {/* Business Status */}
        <div className="absolute top-4 left-4">
          <Badge
            variant={business.isOpen ? "default" : "secondary"}
            className={`${business.isOpen ? "bg-green-500" : "bg-gray-500"} text-white`}
          >
            <Clock className="w-3 h-3 mr-1" />
            {business.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-16 mb-4">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={business.avatar || "/placeholder.svg"} alt={business.name} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-white">
                {business.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Verification Badge */}
            {business.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOwner ? (
              <Button onClick={onEdit} variant="outline">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className={
                    !isFollowing
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : ""
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button onClick={onMessage} variant="outline">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </>
            )}

            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Business Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <Badge className={`${businessTypeColors[business.type]} text-white`}>
              {businessTypeLabels[business.type]}
            </Badge>
          </div>

          <p className="text-gray-600 max-w-2xl">{business.description}</p>

          {/* Location & Rating */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            {business.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{business.location}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{business.rating}</span>
              <span>({business.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-4 border-t">
            <div className="text-center">
              <div className="text-xl font-bold">{business.posts.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{business.followers.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{business.following.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
