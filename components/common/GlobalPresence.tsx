"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimePresence } from '@/hooks/useRealtimeChannel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

interface OnlineUser {
  user_id: string
  username?: string
  avatar_url?: string
  premium_type?: string
  online_at: string
}

export function GlobalPresence() {
  const { user } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [showPresence, setShowPresence] = useState(false)
  
  useRealtimePresence({
    channelName: 'global-presence',
    userId: user?.id || '',
    userInfo: {
      username: user?.username,
      avatar_url: user?.avatar_url,
      premium_type: user?.premium_type
    },
    enabled: !!user,
    onSync: (users) => {
      setOnlineUsers(users.flatMap(u => u))
    },
    onJoin: (newUser) => {
      setOnlineUsers(prev => [...prev, ...newUser])
    },
    onLeave: (leftUser) => {
      setOnlineUsers(prev => 
        prev.filter(u => u.user_id !== leftUser[0]?.user_id)
      )
    }
  })
  
  // Filter out current user
  const otherUsers = onlineUsers.filter(u => u.user_id !== user?.id)
  
  if (!user || otherUsers.length === 0) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed state */}
      {!showPresence && (
        <button
          onClick={() => setShowPresence(true)}
          className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-3 flex items-center space-x-2 hover:shadow-xl transition-all"
        >
          <Users className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium">{otherUsers.length} online</span>
        </button>
      )}
      
      {/* Expanded state */}
      {showPresence && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center">
              <Users className="w-4 h-4 mr-2 text-green-500" />
              Usuários Online ({otherUsers.length})
            </h3>
            <button
              onClick={() => setShowPresence(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            {otherUsers.slice(0, 10).map((onlineUser) => (
              <div
                key={onlineUser.user_id}
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={onlineUser.avatar_url} />
                    <AvatarFallback>
                      {onlineUser.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {onlineUser.username || 'Usuário'}
                  </p>
                  {onlineUser.premium_type && onlineUser.premium_type !== 'free' && (
                    <Badge variant="secondary" className="text-xs">
                      {onlineUser.premium_type}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {otherUsers.length > 10 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                e mais {otherUsers.length - 10} usuários...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}