"use client"

import { MoreHorizontal } from "lucide-react"

interface RightSidebarProps {
  className?: string
}

export function RightSidebar({ className }: RightSidebarProps) {
  return (
    <aside className="right-sidebar sidebar-sticky bg-[#11101a]">
      <div className="p-10 tablet:p-5">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="bg-[#11101a] rounded-full border border-[#363f54] px-4 py-2.5">
            <input
              type="text"
              placeholder="Busque casais, fotos, posts..."
              className="w-full bg-transparent text-[#5b657e] placeholder:text-[#5b657e] outline-none text-base tablet:text-sm"
            />
          </div>
        </div>

        {/* Perfis em alta */}
        <div className="bg-[#11101a] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg tablet:text-base font-bold">Perfis em alta</h3>
            <MoreHorizontal className="w-5 h-5 text-[#9099af]" />
          </div>
          
          {/* Profile items */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 tablet:w-8 tablet:h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                  <div>
                    <p className="text-white text-sm tablet:text-xs font-medium">@usuario_{item}</p>
                    <p className="text-[#9099af] text-xs tablet:text-[10px]">Perfil verificado</p>
                  </div>
                </div>
                <button className="text-xs tablet:text-[10px] px-3 py-1.5 rounded-full border border-[#363f54] text-white hover:bg-white/10 transition-colors">
                  Seguir
                </button>
              </div>
            ))}
          </div>
          
          <button className="text-sm tablet:text-xs bg-gradient-to-b from-[#e69aff] via-[#ff4bc9] to-[#ff5f5f] bg-clip-text text-transparent font-medium mt-4">
            Ver mais
          </button>
        </div>

        {/* Trending Topics */}
        <div className="bg-[#11101a] rounded-2xl p-4 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg tablet:text-base font-bold">Em alta agora</h3>
            <MoreHorizontal className="w-5 h-5 text-[#9099af]" />
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                <p className="text-[#9099af] text-xs tablet:text-[10px]">Trending no Brasil</p>
                <p className="text-white text-sm tablet:text-xs font-medium">#TrendingTopic{item}</p>
                <p className="text-[#9099af] text-xs tablet:text-[10px] mt-1">{item * 2.3}K posts</p>
              </div>
            ))}
          </div>
          
          <button className="text-sm tablet:text-xs bg-gradient-to-b from-[#e69aff] via-[#ff4bc9] to-[#ff5f5f] bg-clip-text text-transparent font-medium mt-4">
            Ver mais trending
          </button>
        </div>
      </div>
    </aside>
  )
}