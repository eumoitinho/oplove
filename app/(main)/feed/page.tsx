import type { Metadata } from "next"
import { FeedLayout } from "@/components/feed/feed-layout"
import { PostCreator } from "@/components/feed/post-creator"
import { PostList } from "@/components/feed/post-list"
import { TrendingSidebar } from "@/components/feed/trending-sidebar"

export const metadata: Metadata = {
  title: "Feed - OpenLove",
  description: "Veja as últimas atualizações da sua rede no OpenLove.",
}

export default function FeedPage() {
  return (
    <FeedLayout>
      <div className="flex-1 max-w-2xl mx-auto">
        <PostCreator />
        <PostList />
      </div>
      <aside className="hidden lg:block w-80">
        <TrendingSidebar />
      </aside>
    </FeedLayout>
  )
}
