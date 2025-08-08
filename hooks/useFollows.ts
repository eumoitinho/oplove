"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./useAuth"
import { supabase } from "@/lib/supabase"
import type { User } from "@/types/database.types"

interface FollowStats {
  followersCount: number
  followingCount: number
  isFollowing: boolean
  isFollowedBy: boolean
}

export function useFollows(userId?: string) {
  const { user } = useAuth()
  const [stats, setStats] = useState<FollowStats>({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
    isFollowedBy: false
  })
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch follow stats
  const fetchStats = useCallback(async () => {
    if (!userId) return

    try {
      // Get followers count
      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId)

      // Get following count
      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId)

      // Check if current user is following this user
      let isFollowing = false
      let isFollowedBy = false

      if (user && user.id !== userId) {
        const { data: followData } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .single()

        isFollowing = !!followData

        const { data: followedByData } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", userId)
          .eq("following_id", user.id)
          .single()

        isFollowedBy = !!followedByData
      }

      setStats({
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        isFollowing,
        isFollowedBy
      })
    } catch (error) {
      console.error("Error fetching follow stats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, user])

  // Fetch followers list
  const fetchFollowers = useCallback(async (limit = 20, offset = 0) => {
    if (!userId) return []

    try {
      const { data, error } = await supabase
        .from("follows")
        .select(`
          follower:users!follower_id(
            id,
            username,
            full_name,
            avatar_url,
            bio,
            premium_type,
            is_verified
          )
        `)
        .eq("following_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const followers = data?.map(item => item.follower).filter(Boolean) || []
      setFollowers(prev => offset === 0 ? followers : [...prev, ...followers])
      return followers
    } catch (error) {
      console.error("Error fetching followers:", error)
      return []
    }
  }, [userId])

  // Fetch following list
  const fetchFollowing = useCallback(async (limit = 20, offset = 0) => {
    if (!userId) return []

    try {
      const { data, error } = await supabase
        .from("follows")
        .select(`
          following:users!following_id(
            id,
            username,
            full_name,
            avatar_url,
            bio,
            premium_type,
            is_verified
          )
        `)
        .eq("follower_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const following = data?.map(item => item.following).filter(Boolean) || []
      setFollowing(prev => offset === 0 ? following : [...prev, ...following])
      return following
    } catch (error) {
      console.error("Error fetching following:", error)
      return []
    }
  }, [userId])

  // Toggle follow status
  const toggleFollow = useCallback(async () => {
    if (!user || !userId || user.id === userId) return false

    try {
      if (stats.isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId)

        if (error) throw error

        setStats(prev => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, prev.followersCount - 1)
        }))

        return false
      } else {
        // Follow
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: user.id,
            following_id: userId
          })

        if (error) throw error

        setStats(prev => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1
        }))

        return true
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
      return stats.isFollowing
    }
  }, [user, userId, stats.isFollowing])

  // Initial fetch
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`follows:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows",
          filter: `following_id=eq.${userId}`
        },
        () => {
          fetchStats()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows",
          filter: `follower_id=eq.${userId}`
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchStats])

  return {
    ...stats,
    followers,
    following,
    isLoading,
    fetchFollowers,
    fetchFollowing,
    toggleFollow,
    refresh: fetchStats
  }
}