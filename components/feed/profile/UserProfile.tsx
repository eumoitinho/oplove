"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Edit, 
  Settings, 
  MoreHorizontal,
  Grid3X3,
  Bookmark,
  Heart,
  Users,
  Image,
  Crown,
  Gem,
  CheckCircle,
  Sparkles,
  MessageCircle,
  Camera,
  Video,
  Music,
  Gamepad2,
  Book,
  Dumbbell,
  Palette,
  Code,
  Share2,
  UserPlus,
  Copy,
  ExternalLink,
  Flag,
  Block,
  UserMinus,
  Download,
  Upload,
  Eye,
  EyeOff,
  Mail,
  Phone,
  ImageIcon
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures"
import { PostCard } from "../post/PostCard"
import { PostSkeleton } from "../PostSkeleton"
import { cn } from "@/lib/utils"
import type { User, Post } from "@/types/common"
import { UserService } from "@/lib/services/user-service"

interface UserProfileProps {
  userId?: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const { user: currentUser } = useAuth()
  const { features } = usePremiumFeatures()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("posts")
  const [isFollowing, setIsFollowing] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    likes: 0
  })
  const [interests, setInterests] = useState<string[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    bio: "",
    location: "",
    website: ""
  })
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const interestIcons: Record<string, any> = {
    "Fotografia": Camera,
    "Vídeos": Video,
    "Música": Music,
    "Games": Gamepad2,
    "Leitura": Book,
    "Fitness": Dumbbell,
    "Arte": Palette,
    "Tecnologia": Code,
    "Viagens": MapPin,
    "Culinária": Sparkles
  }

  const isOwnProfile = !userId || userId === currentUser?.id

  useEffect(() => {
    loadUserProfile()
    loadUserPosts()
  }, [userId])

  useEffect(() => {
    if (user && isOwnProfile) {
      setEditData({
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || ""
      })
    }
  }, [user, isOwnProfile])

  const loadUserProfile = async () => {
    try {
      const targetUserId = userId || currentUser?.id
      if (!targetUserId) return

      let profileUser: User | null = null

      if (isOwnProfile && currentUser) {
        // Use current user data for own profile
        profileUser = currentUser
      } else if (userId) {
        // Load other user's profile from API
        const { data: fetchedUser, error } = await UserService.getUserProfile(userId)
        if (error) {
          console.error('Error loading user profile:', error)
          return
        }
        profileUser = fetchedUser
      }

      if (profileUser) {
        setUser(profileUser)
        setEditData({
          bio: profileUser.bio || "",
          location: profileUser.location || "",
          website: profileUser.website || ""
        })
      }

      // Load real stats from API
      if (targetUserId) {
        const { data: userStats, error: statsError } = await UserService.getUserStats(targetUserId)
        if (userStats && !statsError) {
          setStats(userStats)
        } else {
          console.error('Error loading user stats:', statsError)
          // Fallback to default stats
          setStats({
            posts: 0,
            followers: 0,
            following: 0,
            likes: 0
          })
        }
      }
      
      // Load real interests from API
      if (targetUserId) {
        const { data: userInterests, error: interestsError } = await UserService.getUserInterests(targetUserId)
        if (userInterests && !interestsError) {
          setInterests(userInterests)
        } else {
          // Fallback to empty interests for now
          setInterests([])
        }
      }

      setIsFollowing(false)
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const loadUserPosts = async () => {
    try {
      setLoading(true)
      
      const targetUserId = userId || currentUser?.id
      if (!targetUserId) {
        setPosts([])
        return
      }
      
      const { data: userPosts, error } = await UserService.getUserPosts(targetUserId, 20)
      
      if (error) {
        console.error('Error loading user posts:', error)
        setPosts([])
        return
      }
      
      setPosts(userPosts || [])
    } catch (error) {
      console.error("Error loading posts:", error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      setIsFollowing(!isFollowing)
      setStats(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1
      }))
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  const handleBlock = async () => {
    try {
      setIsBlocked(!isBlocked)
      if (!isBlocked) {
        setIsFollowing(false)
      }
    } catch (error) {
      console.error("Error blocking user:", error)
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const copyProfileLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${user?.username}`
    await navigator.clipboard.writeText(profileUrl)
    // TODO: Show toast
    setShowShareModal(false)
  }

  const shareProfile = async (platform: string) => {
    const profileUrl = `${window.location.origin}/profile/${user?.username}`
    const text = `Confira o perfil de ${user?.full_name || user?.username} no OpenLove!`
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + profileUrl)}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`)
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`)
        break
    }
    setShowShareModal(false)
  }

  const handleReport = () => {
    setShowReportModal(true)
  }

  const submitReport = async (reason: string) => {
    try {
      // TODO: Implement real report
      console.log("Report user:", user?.id, "Reason:", reason)
      setShowReportModal(false)
    } catch (error) {
      console.error("Error reporting user:", error)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return
    
    try {
      setIsUploadingAvatar(true)
      
      // Create preview URL
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)
      setAvatarFile(file)
      
      // Upload to Supabase Storage
      const { data: avatarUrl, error: uploadError } = await UserService.uploadAvatar(user.id, file)
      
      if (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        alert('Erro ao fazer upload da imagem. Tente novamente.')
        return
      }
      
      // Update user profile with new avatar URL
      const { data: updatedUser, error: updateError } = await UserService.updateUserProfile(user.id, {
        avatar_url: avatarUrl
      })
      
      if (updateError) {
        console.error('Error updating profile:', updateError)
        alert('Erro ao atualizar perfil. Tente novamente.')
        return
      }
      
      if (updatedUser) {
        setUser(updatedUser)
        // Clear preview URL since we now have the real URL
        URL.revokeObjectURL(preview)
        setPreviewUrl(null)
        setAvatarFile(null)
      }
      
    } catch (error) {
      console.error("Error uploading avatar:", error)
      alert('Erro inesperado. Tente novamente.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas imagens')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB')
        return
      }
      
      handleAvatarUpload(file)
    }
  }

  const handleEditSave = async () => {
    if (!user?.id) return
    
    try {
      // Save profile changes to database
      const { data: updatedUser, error } = await UserService.updateUserProfile(user.id, {
        bio: editData.bio || null,
        location: editData.location || null,
        website: editData.website || null
      })
      
      if (error) {
        console.error('Error updating profile:', error)
        alert('Erro ao salvar perfil. Tente novamente.')
        return
      }
      
      if (updatedUser) {
        setUser(updatedUser)
      }
      
      setIsEditing(false)
      
      // Clear preview if no actual upload was made
      if (previewUrl && !avatarFile) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert('Erro inesperado. Tente novamente.')
    }
  }

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case "gold":
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-medium">
            <Crown className="w-3 h-3" />
            Gold
          </div>
        )
      case "diamond":
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium">
            <Gem className="w-3 h-3" />
            Diamond
          </div>
        )
      case "couple":
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-medium">
            <Heart className="w-3 h-3" />
            Couple
          </div>
        )
      default:
        return null
    }
  }

  if (!user) return <PostSkeleton />

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm"
      >
        {/* Cover Image Area */}
        <div className="h-48 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 relative">
          {isOwnProfile && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Editar capa
            </Button>
          )}
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative -mt-20 md:-mt-16">
              <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-900 shadow-xl">
                <AvatarImage src={previewUrl || user.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {user.full_name?.charAt(0) || user.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {user.is_verified && (
                <div className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-1.5">
                  <CheckCircle className="w-4 h-4 text-white fill-white" />
                </div>
              )}
              {isOwnProfile && (
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isUploadingAvatar}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isUploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Info and Actions */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {user.full_name || user.username}
                    </h1>
                    {getPlanBadge(user.premium_type)}
                  </div>
                  <p className="text-gray-500 dark:text-white/60 mt-1">@{user.username}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(!isEditing)}
                        className="rounded-full border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? "Cancelar" : "Editar perfil"}
                      </Button>
                      {isEditing && (
                        <Button 
                          onClick={handleEditSave}
                          className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Salvar
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleShare}
                        className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {!isBlocked ? (
                        <>
                          <Button 
                            onClick={handleFollow}
                            disabled={isBlocked}
                            className={cn(
                              "rounded-full transition-all",
                              isFollowing 
                                ? "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20" 
                                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                            )}
                          >
                            {isFollowing ? (
                              <>
                                <Users className="w-4 h-4 mr-2" />
                                Seguindo
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Seguir
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline"
                            disabled={isBlocked}
                            className="rounded-full border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Mensagem
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={handleBlock}
                          variant="outline"
                          className="rounded-full border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Desbloquear
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleShare}
                        className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        {/* Dropdown com mais opções */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 hidden group-hover:block">
                          <button 
                            onClick={handleReport}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Flag className="w-4 h-4" />
                            Denunciar
                          </button>
                          <button 
                            onClick={handleBlock}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                          >
                            {isBlocked ? (
                              <>
                                <Eye className="w-4 h-4" />
                                Desbloquear
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Bloquear
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {isEditing && isOwnProfile ? (
                <div className="mt-4">
                  <Textarea 
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    placeholder="Conte um pouco sobre você..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              ) : user.bio ? (
                <p className="mt-4 text-gray-700 dark:text-white/80 leading-relaxed">{user.bio}</p>
              ) : isOwnProfile ? (
                <p className="mt-4 text-gray-500 dark:text-white/60 italic">
                  Adicione uma bio para se apresentar
                </p>
              ) : null}

              {/* Interests */}
              {interests.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-white/60 mb-2">Interesses</h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => {
                      const Icon = interestIcons[interest] || Sparkles
                      return (
                        <div
                          key={interest}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-sm"
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {interest}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              {isEditing && isOwnProfile ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Localização</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <Input 
                        value={editData.location}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        placeholder="Cidade, Estado"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                    <div className="flex items-center gap-2 mt-1">
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                      <Input 
                        value={editData.website}
                        onChange={(e) => setEditData({...editData, website: e.target.value})}
                        placeholder="https://seusite.com"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-white/60">
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </span>
                  )}
                  {user.website && (
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-purple-600 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {user.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Entrou em {new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-6">
                <div className="text-center">
                  <p className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.posts}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-white/60">Posts</p>
                </div>
                <button className="text-center hover:bg-gray-100 dark:hover:bg-white/10 px-3 py-1 rounded-lg transition">
                  <p className="font-bold text-xl">{stats.followers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-white/60">Seguidores</p>
                </button>
                <button className="text-center hover:bg-gray-100 dark:hover:bg-white/10 px-3 py-1 rounded-lg transition">
                  <p className="font-bold text-xl">{stats.following.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-white/60">Seguindo</p>
                </button>
                <div className="text-center">
                  <p className="font-bold text-xl">{stats.likes.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-white/60">Curtidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-1 rounded-2xl">
          <TabsTrigger 
            value="posts" 
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <Grid3X3 className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="media" 
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <Image className="w-4 h-4" />
            Mídia
          </TabsTrigger>
          <TabsTrigger 
            value="likes" 
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <Heart className="w-4 h-4" />
            Curtidas
          </TabsTrigger>
          <TabsTrigger 
            value="saved" 
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <Bookmark className="w-4 h-4" />
            Salvos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6 space-y-6">
          {loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={{
                  ...post,
                  user: user
                }} 
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl"
            >
              <Grid3X3 className="w-12 h-12 mx-auto text-gray-400 dark:text-white/40 mb-4" />
              <p className="text-gray-500 dark:text-white/60">
                {isOwnProfile ? "Você ainda não fez nenhum post" : "Nenhum post ainda"}
              </p>
              {isOwnProfile && (
                <Button className="mt-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  Criar primeiro post
                </Button>
              )}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-purple-400 dark:text-purple-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="likes" className="mt-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl"
          >
            <Heart className="w-12 h-12 mx-auto text-gray-400 dark:text-white/40 mb-4" />
            <p className="text-gray-500 dark:text-white/60">Posts curtidos aparecerão aqui</p>
          </motion.div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          {isOwnProfile ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl"
            >
              <Bookmark className="w-12 h-12 mx-auto text-gray-400 dark:text-white/40 mb-4" />
              <p className="text-gray-500 dark:text-white/60">Posts salvos aparecerão aqui</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl"
            >
              <Bookmark className="w-12 h-12 mx-auto text-gray-400 dark:text-white/40 mb-4" />
              <p className="text-gray-500 dark:text-white/60">Posts salvos são privados</p>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Compartilhar Perfil</h3>
            <div className="space-y-3">
              <Button
                onClick={copyProfileLink}
                variant="outline"
                className="w-full justify-start"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar link
              </Button>
              <Button
                onClick={() => shareProfile('whatsapp')}
                variant="outline"
                className="w-full justify-start text-green-600"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => shareProfile('twitter')}
                variant="outline"
                className="w-full justify-start text-blue-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => shareProfile('facebook')}
                variant="outline"
                className="w-full justify-start text-blue-800"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowShareModal(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Denunciar Usuário</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Por que você está denunciando este perfil?
            </p>
            <div className="space-y-2">
              {[
                'Spam ou comportamento enganoso',
                'Conteúdo inapropriado',
                'Assédio ou bullying',
                'Perfil falso',
                'Violação de direitos autorais',
                'Outro motivo'
              ].map((reason) => (
                <Button
                  key={reason}
                  onClick={() => submitReport(reason)}
                  variant="ghost"
                  className="w-full justify-start text-left hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {reason}
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowReportModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}