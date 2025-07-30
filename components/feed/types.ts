export interface User {
  name: string
  username: string
  avatar: string
  verified: boolean
  plan: "Free" | "Gold" | "Diamond"
  location?: string
}

export interface PostStats {
  likes: number
  comments: number
  shares: number
}

export interface PollOption {
  text: string
  votes: number
}

export interface Poll {
  question: string
  options: PollOption[]
}

export interface Post {
  id: string
  user: User
  content: string
  timestamp: string
  stats: PostStats
  media?: { type: "image" | "video"; url: string }[]
  poll?: Poll
  isLiked: boolean
  isSaved: boolean
}
