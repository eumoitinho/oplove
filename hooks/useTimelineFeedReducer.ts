"use client"

import { useReducer, useCallback, useMemo } from "react"
import type { Post } from "@/types/database.types"

interface TimelineFeedState {
  posts: Post[]
  page: number
  hasMore: boolean
  initialized: boolean
  isLoading: boolean
  isRefreshing: boolean
  newPostsCount: number
  activeTab: "for-you" | "following" | "explore"
  error: string | null
}

type TimelineFeedAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_POSTS"; payload: { posts: Post[]; page: number; hasMore: boolean } }
  | { type: "APPEND_POSTS"; payload: { posts: Post[]; page: number; hasMore: boolean } }
  | { type: "SET_TAB"; payload: "for-you" | "following" | "explore" }
  | { type: "SET_NEW_POSTS_COUNT"; payload: number }
  | { type: "INCREMENT_NEW_POSTS" }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_STATE" }
  | { type: "INITIALIZE"; payload: { posts: Post[]; hasMore: boolean } }

const initialState: TimelineFeedState = {
  posts: [],
  page: 1,
  hasMore: true,
  initialized: false,
  isLoading: false,
  isRefreshing: false,
  newPostsCount: 0,
  activeTab: "for-you",
  error: null
}

function timelineFeedReducer(state: TimelineFeedState, action: TimelineFeedAction): TimelineFeedState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    
    case "SET_REFRESHING":
      return { ...state, isRefreshing: action.payload }
    
    case "SET_POSTS":
      return {
        ...state,
        posts: action.payload.posts,
        page: action.payload.page,
        hasMore: action.payload.hasMore,
        initialized: true,
        isLoading: false,
        error: null
      }
    
    case "APPEND_POSTS":
      return {
        ...state,
        posts: [...state.posts, ...action.payload.posts],
        page: action.payload.page,
        hasMore: action.payload.hasMore,
        isLoading: false
      }
    
    case "SET_TAB":
      // Don't reset posts when changing tabs - let the effect handle it
      return { ...state, activeTab: action.payload }
    
    case "SET_NEW_POSTS_COUNT":
      return { ...state, newPostsCount: action.payload }
    
    case "INCREMENT_NEW_POSTS":
      return { ...state, newPostsCount: state.newPostsCount + 1 }
    
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false, isRefreshing: false }
    
    case "RESET_STATE":
      return { ...initialState, activeTab: state.activeTab }
    
    case "INITIALIZE":
      return {
        ...state,
        posts: action.payload.posts,
        hasMore: action.payload.hasMore,
        initialized: true,
        page: 1,
        isLoading: false
      }
    
    default:
      return state
  }
}

export function useTimelineFeedReducer() {
  const [state, dispatch] = useReducer(timelineFeedReducer, initialState)
  
  // Memoized action creators
  const actions = useMemo(() => ({
    setLoading: (loading: boolean) => dispatch({ type: "SET_LOADING", payload: loading }),
    setRefreshing: (refreshing: boolean) => dispatch({ type: "SET_REFRESHING", payload: refreshing }),
    setPosts: (posts: Post[], page: number, hasMore: boolean) => 
      dispatch({ type: "SET_POSTS", payload: { posts, page, hasMore } }),
    appendPosts: (posts: Post[], page: number, hasMore: boolean) =>
      dispatch({ type: "APPEND_POSTS", payload: { posts, page, hasMore } }),
    setTab: (tab: "for-you" | "following" | "explore") =>
      dispatch({ type: "SET_TAB", payload: tab }),
    setNewPostsCount: (count: number) =>
      dispatch({ type: "SET_NEW_POSTS_COUNT", payload: count }),
    incrementNewPosts: () => dispatch({ type: "INCREMENT_NEW_POSTS" }),
    setError: (error: string | null) => dispatch({ type: "SET_ERROR", payload: error }),
    resetState: () => dispatch({ type: "RESET_STATE" }),
    initialize: (posts: Post[], hasMore: boolean) =>
      dispatch({ type: "INITIALIZE", payload: { posts, hasMore } })
  }), [])
  
  return { state, ...actions }
}