"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <Link href="/" className="flex items-center space-x-2 mb-8">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">OpenLove</span>
            </Link>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Encontre conexões autênticas</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              A rede social brasileira feita para relacionamentos verdadeiros e duradouros.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Perfis verificados</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Comunidade brasileira</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Conexões seguras</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right side - Form */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="lg:hidden mb-8 text-center">
              <Link href="/" className="inline-flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">OpenLove</span>
              </Link>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
