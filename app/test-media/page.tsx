"use client"

import { PostCard } from "@/components/feed/post/PostCard"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { Post } from "@/types/database.types"

// Mock posts com diferentes tipos de mídia
const mockPosts: Post[] = [
  // Post com imagem única
  {
    id: "1",
    content: "Post com uma imagem",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "user-1",
    likes_count: 5,
    comments_count: 2,
    shares_count: 1,
    saves_count: 0,
    media_urls: ["https://picsum.photos/600/400"],
    media_types: ["image"],
    visibility: "public",
    user: {
      id: "user-1",
      username: "testuser1",
      name: "Test User 1",
      avatar_url: "https://picsum.photos/100/100",
      is_verified: true,
      premium_type: "diamond",
      location: "São Paulo, SP"
    }
  },
  // Post com múltiplas imagens
  {
    id: "2",
    content: "Post com múltiplas imagens (galeria)",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "user-2",
    likes_count: 10,
    comments_count: 5,
    shares_count: 3,
    saves_count: 2,
    media_urls: [
      "https://picsum.photos/600/400?random=1",
      "https://picsum.photos/600/400?random=2",
      "https://picsum.photos/600/400?random=3",
      "https://picsum.photos/600/400?random=4"
    ],
    media_types: ["image", "image", "image", "image"],
    visibility: "public",
    user: {
      id: "user-2",
      username: "testuser2",
      name: "Test User 2",
      avatar_url: "https://picsum.photos/100/100?random=2",
      is_verified: false,
      premium_type: "gold",
      location: "Rio de Janeiro, RJ"
    }
  },
  // Post com vídeo
  {
    id: "3",
    content: "Post com vídeo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "user-3",
    likes_count: 20,
    comments_count: 8,
    shares_count: 5,
    saves_count: 4,
    media_urls: ["https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"],
    media_types: ["video"],
    visibility: "public",
    user: {
      id: "user-3",
      username: "testuser3",
      name: "Test User 3",
      avatar_url: "https://picsum.photos/100/100?random=3",
      is_verified: true,
      premium_type: "couple",
      location: "Curitiba, PR"
    }
  },
  // Post com áudio
  {
    id: "4",
    content: "Post com áudio",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "user-4",
    likes_count: 15,
    comments_count: 3,
    shares_count: 2,
    saves_count: 1,
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    audio_title: "Sample Audio Track",
    visibility: "public",
    user: {
      id: "user-4",
      username: "testuser4",
      name: "Test User 4",
      avatar_url: "https://picsum.photos/100/100?random=4",
      is_verified: false,
      premium_type: "free",
      location: "Belo Horizonte, MG"
    }
  },
  // Post com enquete
  {
    id: "5",
    content: "Post com enquete",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "user-5",
    likes_count: 25,
    comments_count: 12,
    shares_count: 4,
    saves_count: 3,
    visibility: "public",
    poll: {
      id: "poll-1",
      question: "Qual é o melhor tipo de post?",
      options: [
        { id: "opt-1", text: "Posts com fotos", votes: 10 },
        { id: "opt-2", text: "Posts com vídeos", votes: 15 },
        { id: "opt-3", text: "Posts com áudio", votes: 5 },
        { id: "opt-4", text: "Posts com enquetes", votes: 20 }
      ],
      ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      is_multiple_choice: false,
      user_voted: false
    },
    user: {
      id: "user-5",
      username: "testuser5",
      name: "Test User 5",
      avatar_url: "https://picsum.photos/100/100?random=5",
      is_verified: true,
      premium_type: "diamond",
      location: "Brasília, DF"
    }
  },
  // Post com vídeo e texto
  {
    id: "6",
    content: "Post misto: vídeo com legenda longa para testar como fica a exibição quando tem muito texto junto com mídia de vídeo. Isso é importante para garantir que o layout funciona bem em diferentes cenários.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "user-6",
    likes_count: 30,
    comments_count: 15,
    shares_count: 7,
    saves_count: 5,
    media_urls: ["https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"],
    media_types: ["video"],
    visibility: "public",
    user: {
      id: "user-6",
      username: "testuser6",
      name: "Test User 6",
      avatar_url: "https://picsum.photos/100/100?random=6",
      is_verified: false,
      premium_type: "gold",
      location: "Salvador, BA"
    }
  }
]

export default function TestMediaPage() {
  const [showAll, setShowAll] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["all"])

  const filteredPosts = showAll 
    ? mockPosts 
    : mockPosts.filter(post => {
        if (selectedTypes.includes("all")) return true
        if (selectedTypes.includes("image") && post.media_urls?.some(url => !url.includes('.mp4'))) return true
        if (selectedTypes.includes("video") && post.media_urls?.some(url => url.includes('.mp4'))) return true
        if (selectedTypes.includes("audio") && post.audio_url) return true
        if (selectedTypes.includes("poll") && post.poll) return true
        return false
      })

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Teste de Tipos de Mídia</h1>
      
      {/* Filtros */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Filtrar por tipo:</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTypes.includes("all") ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTypes(["all"])}
          >
            Todos
          </Button>
          <Button
            variant={selectedTypes.includes("image") ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTypes(prev => 
              prev.includes("image") 
                ? prev.filter(t => t !== "image")
                : [...prev.filter(t => t !== "all"), "image"]
            )}
          >
            Imagens
          </Button>
          <Button
            variant={selectedTypes.includes("video") ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTypes(prev => 
              prev.includes("video") 
                ? prev.filter(t => t !== "video")
                : [...prev.filter(t => t !== "all"), "video"]
            )}
          >
            Vídeos
          </Button>
          <Button
            variant={selectedTypes.includes("audio") ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTypes(prev => 
              prev.includes("audio") 
                ? prev.filter(t => t !== "audio")
                : [...prev.filter(t => t !== "all"), "audio"]
            )}
          >
            Áudio
          </Button>
          <Button
            variant={selectedTypes.includes("poll") ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTypes(prev => 
              prev.includes("poll") 
                ? prev.filter(t => t !== "poll")
                : [...prev.filter(t => t !== "all"), "poll"]
            )}
          >
            Enquetes
          </Button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {filteredPosts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum post encontrado com os filtros selecionados.
        </div>
      )}
    </div>
  )
}