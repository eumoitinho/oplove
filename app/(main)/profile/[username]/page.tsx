import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { MainLayout } from "@/components/common/main-layout"
import { getUserByUsername } from "@/services/user-service"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const user = await getUserByUsername(params.username)

  if (!user) {
    return {
      title: "Usuário não encontrado - OpenLove",
    }
  }

  return {
    title: `${user.full_name || user.username} - OpenLove`,
    description: user.bio || `Perfil de ${user.full_name || user.username} no OpenLove`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getUserByUsername(params.username)

  if (!user) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <ProfileHeader user={user} />
        <ProfileTabs user={user} />
      </div>
    </MainLayout>
  )
}
