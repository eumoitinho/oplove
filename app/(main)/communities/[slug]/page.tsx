import { notFound } from "next/navigation"
import { communityService } from "@/lib/services/community.service"
import { CommunityPageClient } from "./community-page-client"

interface CommunityPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CommunityPageProps) {
  const community = await communityService.getCommunity(params.slug)
  
  if (!community) {
    return {
      title: "Comunidade não encontrada - OpenLove"
    }
  }

  return {
    title: `${community.name} - OpenLove`,
    description: community.description
  }
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const community = await communityService.getCommunity(params.slug)

  if (!community) {
    notFound()
  }

  return <CommunityPageClient community={community} />
}