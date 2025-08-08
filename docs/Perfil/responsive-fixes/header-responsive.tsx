// Exemplo de Header Responsivo para OpenLove
// Solução para telas de 360px

import { useState } from 'react';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ResponsiveHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Header Principal */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
        <div className="flex items-center justify-between h-14 px-2 xs:px-4">
          {/* Menu Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo - Responsivo */}
          <div className="flex items-center flex-1 md:flex-none">
            <h1 className="text-lg xs:text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              <span className="hidden xs:inline">OpenLove</span>
              <span className="xs:hidden">OL</span>
            </h1>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar no OpenLove"
                className="w-full py-2 pl-10 pr-4 bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Ações Mobile */}
          <div className="flex items-center space-x-1 md:hidden">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* Criar Post - Mobile Only */}
            <button
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center xs:hidden"
              aria-label="Criar post"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Ações Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-800 rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-full">
              <div className="w-8 h-8 rounded-full bg-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Busca Mobile */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-gray-900 z-[60] md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header do Modal */}
              <div className="flex items-center p-4 border-b border-gray-800">
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 -ml-2 min-w-[44px] min-h-[44px]"
                >
                  <span className="sr-only">Fechar busca</span>
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" />
                  </svg>
                </button>
                
                <div className="flex-1 ml-4">
                  <input
                    type="search"
                    placeholder="Buscar no OpenLove"
                    className="w-full py-2 px-4 bg-gray-800 rounded-full text-sm focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Resultados da Busca */}
              <div className="flex-1 overflow-y-auto">
                {/* Conteúdo dos resultados */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}