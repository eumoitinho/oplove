"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AtSign, Hash, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"

interface User {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  is_verified?: boolean
}

interface Hashtag {
  id: string
  name: string
  posts_count: number
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  maxLength?: number
  className?: string
  rows?: number
}

// Mock data - replace with real API calls
const mockUsers: User[] = [
  {
    id: "1",
    username: "johndoe",
    full_name: "John Doe",
    avatar_url: "/avatars/john.jpg",
    is_verified: true,
  },
  {
    id: "2",
    username: "janedoe",
    full_name: "Jane Doe",
    avatar_url: "/avatars/jane.jpg",
    is_verified: false,
  },
  {
    id: "3",
    username: "alexsmith",
    full_name: "Alex Smith",
    avatar_url: "/avatars/alex.jpg",
    is_verified: true,
  },
]

const mockHashtags: Hashtag[] = [
  { id: "1", name: "openlove", posts_count: 1234 },
  { id: "2", name: "brasil", posts_count: 5678 },
  { id: "3", name: "amor", posts_count: 910 },
  { id: "4", name: "relacionamento", posts_count: 456 },
  { id: "5", name: "casal", posts_count: 789 },
]

export function MentionInput({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  maxLength,
  className,
  rows = 3,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionType, setSuggestionType] = useState<"user" | "hashtag" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<(User | Hashtag)[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Search for users or hashtags
  useEffect(() => {
    if (!debouncedSearchQuery || !suggestionType) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (suggestionType === "user") {
        const filtered = mockUsers.filter(
          (user) =>
            user.username.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            user.full_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
        setSuggestions(filtered)
      } else {
        const filtered = mockHashtags.filter((tag) =>
          tag.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
        setSuggestions(filtered)
      }
      setIsLoading(false)
    }, 200)
  }, [debouncedSearchQuery, suggestionType])

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const newCursorPosition = e.target.selectionStart

    // Check for @ or # triggers
    const lastChar = newValue[newCursorPosition - 1]
    const prevChar = newValue[newCursorPosition - 2]
    
    if (lastChar === "@" && (!prevChar || prevChar === " " || prevChar === "\n")) {
      setSuggestionType("user")
      setShowSuggestions(true)
      setSearchQuery("")
      setSelectedIndex(0)
    } else if (lastChar === "#" && (!prevChar || prevChar === " " || prevChar === "\n")) {
      setSuggestionType("hashtag")
      setShowSuggestions(true)
      setSearchQuery("")
      setSelectedIndex(0)
    } else if (showSuggestions) {
      // Update search query
      const triggerChar = suggestionType === "user" ? "@" : "#"
      const lastTriggerIndex = newValue.lastIndexOf(triggerChar, newCursorPosition - 1)
      
      if (lastTriggerIndex !== -1) {
        const query = newValue.substring(lastTriggerIndex + 1, newCursorPosition)
        
        // Check if the query contains a space or newline (end of mention/hashtag)
        if (query.includes(" ") || query.includes("\n")) {
          setShowSuggestions(false)
          setSuggestionType(null)
        } else {
          setSearchQuery(query)
        }
      }
    }

    setCursorPosition(newCursorPosition)
    onChange(newValue)
  }

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion: User | Hashtag) => {
    if (!textareaRef.current || !suggestionType) return

    const triggerChar = suggestionType === "user" ? "@" : "#"
    const lastTriggerIndex = value.lastIndexOf(triggerChar, cursorPosition - 1)
    
    if (lastTriggerIndex !== -1) {
      const beforeTrigger = value.substring(0, lastTriggerIndex)
      const afterCursor = value.substring(cursorPosition)
      
      let insertText: string
      if (suggestionType === "user") {
        insertText = `@${(suggestion as User).username} `
      } else {
        insertText = `#${(suggestion as Hashtag).name} `
      }
      
      const newValue = beforeTrigger + insertText + afterCursor
      onChange(newValue)
      
      // Set cursor position after the inserted text
      const newCursorPosition = lastTriggerIndex + insertText.length
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
          textareaRef.current.focus()
        }
      }, 0)
    }

    setShowSuggestions(false)
    setSuggestionType(null)
    setSearchQuery("")
    setSelectedIndex(0)
  }, [value, cursorPosition, suggestionType, onChange])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case "Enter":
        if (showSuggestions && suggestions[selectedIndex]) {
          e.preventDefault()
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSuggestionType(null)
        break
    }
  }

  // Check if item is a user
  const isUser = (item: User | Hashtag): item is User => {
    return "username" in item
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          "resize-none",
          className
        )}
      />

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full max-w-sm mt-1 bg-white border rounded-lg shadow-lg"
          >
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Buscando...</p>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={isUser(suggestion) ? suggestion.id : suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors",
                        selectedIndex === index && "bg-gray-50"
                      )}
                    >
                      {isUser(suggestion) ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={suggestion.avatar_url} alt={suggestion.full_name} />
                            <AvatarFallback>
                              {suggestion.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {suggestion.full_name}
                              {suggestion.is_verified && " ✓"}
                            </p>
                            <p className="text-xs text-gray-500">@{suggestion.username}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Hash className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">#{suggestion.name}</p>
                            <p className="text-xs text-gray-500">
                              {suggestion.posts_count.toLocaleString()} posts
                            </p>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">Nenhum resultado encontrado</p>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">
                    {suggestionType === "user" 
                      ? "Digite para buscar usuários" 
                      : "Digite para buscar hashtags"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}