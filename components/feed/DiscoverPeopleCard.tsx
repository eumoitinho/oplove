"use client";

import { Users, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DiscoverProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  interests: string[];
  verified: boolean;
  premium: "free" | "gold" | "diamond";
}

interface DiscoverPeopleCardProps {
  className?: string;
  onProfileClick?: (userId: string) => void;
  onFollowClick?: (userId: string) => void;
}

const mockProfiles: DiscoverProfile[] = [
  {
    id: "1",
    name: "Luna Silva",
    username: "@lunasilva",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=luna",
    bio: "Explorando fantasias e conexões autênticas 🔥",
    interests: ["Swing", "Viagens", "Fotografia"],
    verified: true,
    premium: "diamond"
  },
  {
    id: "2", 
    name: "Casal Fire",
    username: "@casalfire",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=casal",
    bio: "Casal liberal em busca de novas experiências",
    interests: ["Casais", "Festas", "Aventuras"],
    verified: true,
    premium: "gold"
  },
  {
    id: "3",
    name: "Alex Santos",
    username: "@alexsantos",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    bio: "Mente aberta, coração livre",
    interests: ["Encontros", "Música", "Arte"],
    verified: false,
    premium: "free"
  }
];

export function DiscoverPeopleCard({ 
  className, 
  onProfileClick, 
  onFollowClick 
}: DiscoverPeopleCardProps) {
  return (
    <Card className={cn(
      "bg-white/80 dark:bg-white/5",
      "backdrop-blur-sm border-gray-200 dark:border-white/10",
      "rounded-2xl shadow-sm",
      "hover:bg-white/90 dark:hover:bg-white/10",
      "transition-all duration-300",
      className
    )}>
      <CardHeader className="p-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Users className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Descobrir Pessoas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockProfiles.map((profile) => (
          <div key={profile.id} className="flex items-start gap-3">
            <button
              onClick={() => onProfileClick?.(profile.id)}
              className="relative group"
            >
              <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-purple-500 transition-all">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
              {profile.verified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[8px]">✓</span>
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <button
                onClick={() => onProfileClick?.(profile.id)}
                className="group"
              >
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                    {profile.name}
                  </span>
                  {profile.premium === "diamond" && (
                    <Badge className="h-4 px-1 text-[10px] bg-purple-500 text-white">
                      💎
                    </Badge>
                  )}
                  {profile.premium === "gold" && (
                    <Badge className="h-4 px-1 text-[10px] bg-yellow-500 text-white">
                      ⭐
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile.username}
                </p>
              </button>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {profile.bio}
              </p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {profile.interests.slice(0, 2).map((interest, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline" 
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3"
              onClick={() => onFollowClick?.(profile.id)}
            >
              <UserPlus className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        <Button 
          variant="ghost" 
          className="w-full h-8 text-xs hover:bg-purple-50 dark:hover:bg-purple-950/30"
          onClick={() => onProfileClick?.("discover-all")}
        >
          Ver mais sugestões
        </Button>
      </CardContent>
    </Card>
  );
}