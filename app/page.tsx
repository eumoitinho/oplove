"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Sparkles,
  Moon,
  Sun,
  Grid3X3,
  ImageIcon,
  FileText,
  Video,
  Music,
  Layers,
  Infinity,
  Zap,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button, Chip } from "@heroui/react"
import { ArrowRight, Heart, Moon, Sun, MessageSquare, Calendar, Lock, Search, Star } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Logo from "@/components/openlove/logo"

export default function OpenLoveLanding() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringDesignElement, setIsHoveringDesignElement] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const scrollRef = useRef<NodeJS.Timeout | null>(null)
  const mouseRef = useRef<NodeJS.Timeout | null>(null)


  // Check system preference on initial load and session status
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
      
      // Verificar se a sessão expirou
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get("session") === "expired") {
        setSessionExpired(true)
        // Limpar o parâmetro da URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

  // Handle scroll for morphing animation with debounce
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        clearTimeout(scrollRef.current)
      }
      scrollRef.current = setTimeout(() => {
        setScrollY(window.scrollY)
      }, 10) // Small debounce for smoother performance
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      if (scrollRef.current) clearTimeout(scrollRef.current)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Track mouse position for magnetic effects with debounce
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRef.current) {
        clearTimeout(mouseRef.current)
      }
      mouseRef.current = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }, 10) // Small debounce for smoother performance
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => {
      if (mouseRef.current) clearTimeout(mouseRef.current)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  // Calculate morphing progress based on scroll - simplified
  const getShapeProgress = () => {
    if (typeof window === "undefined") return { borderRadius: "50%", rotation: "0deg" }
    const windowHeight = window.innerHeight
    const totalScrollHeight = document.documentElement.scrollHeight - windowHeight

    // Avoid division by zero
    if (totalScrollHeight <= 0) return { borderRadius: "50%", rotation: "0deg" }

    // First transition: circle to square (0% to 40% of scroll)
    const firstTransition = Math.min(scrollY / (totalScrollHeight * 0.4), 1)

    // Second transition: square back to circle (60% to 100% of scroll)
    const secondTransitionStart = totalScrollHeight * 0.6
    const secondTransition = Math.max(0, Math.min((scrollY - secondTransitionStart) / (totalScrollHeight * 0.4), 1))

    // Calculate border radius
    let borderRadius = "50%"
    if (secondTransition > 0) {
      // Morphing back to circle
      borderRadius = `${secondTransition * 50}%`
    } else {
      // Morphing to square
      borderRadius = `${(1 - firstTransition) * 50}%`
    }

    // Calculate rotation - simplified
    const rotation = `${firstTransition * 20 - secondTransition * 20}deg`

    return { borderRadius, rotation }
  }

  const { borderRadius, rotation } = getShapeProgress()

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-500 ${
        isHoveringDesignElement ? "cursor-crosshair" : "cursor-default"
      }`}
    >
      {/* Custom CSS for enhanced UX - simplified */}
      <style jsx global>{`
        ::selection {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? "rgba(15, 23, 42, 0.1)" : "rgba(243, 244, 246, 0.5)"};
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.3)"};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.5)" : "rgba(190, 24, 93, 0.5)"};
        }
        
        /* Breathing animation - simplified */
        @keyframes subtle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
        
        .subtle-breathe {
          animation: subtle-breathe 6s ease-in-out infinite;
          will-change: transform;
        }
        
        /* Hardware acceleration for performance */
        .hw-accelerate {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>

      {/* Artistic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(190,24,93,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />
      <div className="fixed top-0 left-0 w-full h-full">
        <div className="absolute top-[10%] left-[5%] w-32 md:w-64 h-32 md:h-64 rounded-full bg-gradient-to-r from-pink-500/5 to-purple-500/5 dark:from-pink-500/10 dark:to-purple-500/10 blur-3xl subtle-breathe" />
        <div
          className="absolute top-[40%] right-[10%] w-40 md:w-80 h-40 md:h-80 rounded-full bg-gradient-to-r from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] w-36 md:w-72 h-36 md:h-72 rounded-full bg-gradient-to-r from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Session Expired Notification */}
        {sessionExpired && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Sua sessão expirou. Faça login novamente para continuar.</span>
            <button 
              onClick={() => setSessionExpired(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Responsive Navigation */}
        <nav className="fixed top-4 md:top-8 right-4 md:right-8 z-50" role="navigation" aria-label="Main navigation">
          <div className="flex items-center gap-3 md:gap-6">
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="text-sm md:text-lg font-light text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 px-2 md:px-4 rounded-full group"
              aria-label="Toggle between light and dark theme"
            >
              <div className="group-hover:rotate-180 transition-transform duration-500">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
            </Button>
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className="text-sm md:text-lg font-light text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 px-2 md:px-4"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90 px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-base hover:scale-105 transition-all duration-300 hover:shadow-lg">
                Cadastre-se
              </Button>
            </Link>
          </div>
        </nav>

        {/* Creative Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-8 md:px-12 lg:px-16 relative">
          {/* Morphing Circles/Squares - simplified with CSS variables */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] lg:w-[800px] h-[400px] md:h-[600px] lg:h-[800px] border border-gray-200 dark:border-white/05 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation})` }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[450px] lg:w-[600px] h-[300px] md:h-[450px] lg:h-[600px] border border-gray-200 dark:border-white/10 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation === "0deg" ? "0deg" : `-${rotation}`})` }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[300px] lg:w-[400px] h-[200px] md:h-[300px] lg:h-[400px] border border-gray-300 dark:border-white/20 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation === "0deg" ? "0deg" : `${Number.parseFloat(rotation) * 0.5}deg`})` }}
          />

          <div className="max-w-6xl mx-auto text-center relative">
            <Badge
              variant="outline"
              className="hidden md:inline-flex mb-8 md:mb-12 text-xs md:text-sm font-light border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/80 px-3 md:px-4 py-1.5 md:py-2 items-center"
            >
              <Heart className="w-3 h-3 mr-2" />
              Conexões com Liberdade e Respeito
            </Badge>

            <Logo />

            <p className="text-lg md:text-2xl lg:text-3xl text-gray-700 dark:text-white/80 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed font-light">
              Viva novas conexões com casais e pessoas que compartilham sua visão de liberdade, respeito e
              autenticidade.
            </p>

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Link href="/auth/signup">
                <Button className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 md:px-8 py-4 md:py-6 text-lg md:text-xl group">
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Creative Showcase */}
        <section className="py-24 md:py-32 relative" aria-labelledby="showcase-heading">
          <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Left Column */}
              <div className="lg:col-span-5 flex flex-col justify-start lg:pr-16 mb-16 lg:mb-0">
                <h2
                  id="showcase-heading"
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 md:mb-12 leading-tight"
                >
                  Conecte-se como{" "}
                  <span className="bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
                    nunca
                  </span>
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-white/70 mb-8 md:mb-12 leading-relaxed">
                  Encontre casais e pessoas em sua cidade, participe de eventos e construa conexões autênticas em um
                  ambiente seguro.
                </p>
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="w-16 md:w-20 h-[2px] bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400" />
                  <p className="text-sm md:text-base text-gray-500 dark:text-white/50">
                    Ideal para amizades e eventos locais
                  </p>
                </div>
              </div>

              {/* Right Column - Showcase Preview */}
              <div className="lg:col-span-7 relative">
                <div className="absolute -top-10 md:-top-20 -left-10 md:-left-20 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 blur-3xl" />
                <div className="absolute -bottom-10 md:-bottom-20 -right-10 md:-right-20 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 blur-3xl" />

                <div
                  className="grid grid-cols-4 grid-rows-4 gap-3 md:gap-4 h-[400px] md:h-[500px] lg:h-[600px] relative"
                  onMouseEnter={() => setIsHoveringDesignElement(true)}
                  onMouseLeave={() => setIsHoveringDesignElement(false)}
                >
                  {/* Hero Box - Conexões (emphasized with special styling) */}
                  <div className="col-span-2 row-span-2 rounded-2xl md:rounded-3xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/15 dark:to-rose-500/15 backdrop-blur-sm border-2 border-pink-300/50 dark:border-pink-400/30 p-4 md:p-6 transition-all duration-500 flex flex-col justify-between shadow-lg group hover:scale-[1.02] hover:shadow-xl hover:border-pink-400/70 dark:hover:border-pink-400/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 dark:from-pink-500/10 dark:to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-pink-600 dark:text-pink-400">DESTAQUE</span>
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white relative z-10">
                      Conexões
                    </h3>
                  </div>

                  <div className="col-span-2 row-span-1 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-3 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.02] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-purple-300 dark:hover:border-purple-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-lg md:text-2xl font-medium text-gray-900 dark:text-white relative z-10">
                      Eventos
                    </h3>
                  </div>

                  <div className="col-span-1 row-span-1 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-2 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.05] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-red-300 dark:hover:border-red-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-sm md:text-xl font-medium text-gray-900 dark:text-white relative z-10">
                      Chats
                    </h3>
                  </div>

                  <div className="col-span-1 row-span-2 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-2 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.05] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-violet-300 dark:hover:border-violet-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-sm md:text-xl font-medium text-gray-900 dark:text-white relative z-10">
                      Galeria
                    </h3>
                  </div>

                  <div className="col-span-2 row-span-1 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-3 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.02] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-rose-300 dark:hover:border-rose-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-lg md:text-2xl font-medium text-gray-900 dark:text-white relative z-10">
                      Comunidade
                    </h3>
                  </div>

                  <div className="col-span-1 row-span-1 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-2 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.05] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-purple-300 dark:hover:border-purple-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-sm md:text-xl font-medium text-gray-900 dark:text-white relative z-10">
                      Perfil
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Artistic Approach */}
        <section className="py-24 md:py-32 relative" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16">
            <div className="mb-20 md:mb-28 max-w-3xl">
              <h2
                id="features-heading"
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 md:mb-12 leading-tight"
              >
                <span className="bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                  Ferramentas
                </span>{" "}
                para Conectar
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-white/70 leading-relaxed">
                Tudo que você precisa para encontrar pessoas incríveis, criar eventos e construir conexões autênticas.
              </p>
            </div>

            <div className="relative">
              {/* Artistic Feature Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 lg:gap-28">
                <article className="relative">
                  <div className="absolute -top-5 md:-top-10 -left-5 md:-left-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-pink-500/5 to-rose-500/5 dark:from-pink-500/10 dark:to-rose-500/10 blur-3xl" />
                  <div className="mb-8 md:mb-12 w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <Search className="w-8 md:w-10 h-8 md:h-10 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                    Busca Inteligente
                  </h3>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed mb-8 md:mb-12">
                    Encontre pessoas por interesses, localização ou estilo de vida com filtros personalizados.
                  </p>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="h-16 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/15 dark:to-rose-500/15 backdrop-blur-sm border border-pink-200 dark:border-pink-400/20 shadow-sm flex items-center justify-center group hover:scale-105 hover:-rotate-1 hover:shadow-lg transition-all duration-500">
                      <div className="grid grid-cols-2 gap-1 group-hover:gap-1.5 transition-all duration-300">
                        <div className="w-2 h-2 bg-pink-400 rounded-sm group-hover:bg-pink-500 transition-colors duration-300" />
                        <div className="w-2 h-2 bg-rose-400 rounded-sm group-hover:bg-rose-500 transition-colors duration-300" />
                        <div className="w-2 h-2 bg-rose-400 rounded-sm group-hover:bg-rose-500 transition-colors duration-300" />
                        <div className="w-2 h-2 bg-pink-400 rounded-sm group-hover:bg-pink-500 transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="h-16 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-rose-500/10 to-red-500/10 dark:from-rose-500/15 dark:to-red-500/15 backdrop-blur-sm border border-rose-200 dark:border-rose-400/20 shadow-sm flex items-center justify-center group hover:scale-105 hover:shadow-lg transition-all duration-500 delay-75">
                      <div className="grid grid-cols-3 gap-1 group-hover:gap-1.5 transition-all duration-300">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-sm group-hover:bg-rose-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-sm group-hover:bg-red-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-sm group-hover:bg-rose-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-sm group-hover:bg-red-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-sm group-hover:bg-rose-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-sm group-hover:bg-red-500 transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="h-16 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-red-500/10 to-purple-500/10 dark:from-red-500/15 dark:to-purple-500/15 backdrop-blur-sm border border-red-200 dark:border-red-400/20 shadow-sm flex items-center justify-center group hover:scale-105 hover:rotate-1 hover:shadow-lg transition-all duration-500 delay-150">
                      <Search className="w-6 h-6 text-red-500 group-hover:text-red-600 group-hover:scale-110 transition-all duration-300" />
                    </div>
                  </div>
                </article>

                <article className="relative">
                  <div className="absolute -top-5 md:-top-10 -right-5 md:-right-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10 blur-3xl" />
                  <div className="mb-8 md:mb-12 w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-8 md:w-10 h-8 md:h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                    Chat em Tempo Real
                  </h3>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed mb-8 md:mb-12">
                    Converse com conexões mútuas gratuitamente ou com qualquer pessoa no plano premium.
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="h-24 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/15 dark:to-violet-500/15 backdrop-blur-sm border border-purple-200 dark:border-purple-400/20 shadow-sm flex flex-col items-center justify-center gap-2 group hover:scale-105 hover:-rotate-1 hover:shadow-lg transition-all duration-500">
                      <div className="flex gap-2 group-hover:gap-3 transition-all duration-300">
                        <MessageSquare className="w-4 h-4 text-purple-500 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-300" />
                        <Heart className="w-4 h-4 text-violet-500 group-hover:text-violet-600 group-hover:scale-110 transition-all duration-300 delay-75" />
                      </div>
                      <div className="w-8 h-1 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full group-hover:w-10 transition-all duration-300" />
                    </div>
                    <div className="h-24 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/15 dark:to-indigo-500/15 backdrop-blur-sm border border-violet-200 dark:border-violet-400/20 shadow-sm flex flex-col items-center justify-center gap-2 group hover:scale-105 hover:rotate-1 hover:shadow-lg transition-all duration-500 delay-75">
                      <div className="flex gap-2 group-hover:gap-3 transition-all duration-300">
                        <Star className="w-4 h-4 text-violet-500 group-hover:text-violet-600 group-hover:scale-110 transition-all duration-300" />
                        <MessageSquare className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300 delay-75" />
                      </div>
                      <div className="w-6 h-1 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full group-hover:w-8 transition-all duration-300" />
                    </div>
                  </div>
                </article>

                <article className="relative group">
                  <div className="absolute -bottom-5 md:-bottom-10 -left-5 md:-left-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10 blur-3xl" />
                  <div className="mb-8 md:mb-12 w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-r from-rose-500/10 to-red-500/10 dark:from-rose-500/20 dark:to-red-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <Calendar className="w-8 md:w-10 h-8 md:h-10 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                    Eventos Locais
                  </h3>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed mb-8 md:mb-12">
                    Crie ou participe de eventos em sua cidade para conhecer pessoas com interesses similares.
                  </p>
                  <div className="relative h-32 md:h-40 overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-b from-rose-500/10 via-red-500/10 to-transparent dark:from-rose-500/15 dark:via-red-500/15 dark:to-transparent backdrop-blur-sm border border-rose-200 dark:border-rose-400/20 shadow-sm">
                    {/* Event grid preview */}
                    <div className="absolute inset-0 p-2 md:p-3">
                      <div className="grid grid-cols-4 gap-1 md:gap-1.5 h-full">
                        {/* Row 1 */}
                        <div className="col-span-2 h-6 md:h-8 rounded bg-rose-400/60 group-hover:bg-rose-500/60 transition-colors duration-300" />
                        <div className="col-span-1 h-6 md:h-8 rounded bg-red-400/60 group-hover:bg-red-500/60 transition-colors duration-300" />
                        <div className="col-span-1 h-6 md:h-8 rounded bg-pink-400/60 group-hover:bg-pink-500/60 transition-colors duration-300" />
                        {/* Row 2 */}
                        <div className="col-span-1 h-6 md:h-8 rounded bg-red-400/50 group-hover:bg-red-500/50 transition-colors duration-300" />
                        <div className="col-span-3 h-6 md:h-8 rounded bg-rose-400/50 group-hover:bg-rose-500/50 transition-colors duration-300" />
                        {/* Row 3 */}
                        <div className="col-span-3 h-6 md:h-8 rounded bg-pink-400/40 group-hover:bg-pink-500/40 transition-colors duration-300" />
                        <div className="col-span-1 h-6 md:h-8 rounded bg-rose-400/40 group-hover:bg-rose-500/40 transition-colors duration-300" />
                        {/* Row 4 - Fading */}
                        <div className="col-span-2 h-6 md:h-8 rounded bg-red-400/30 group-hover:bg-red-500/30 transition-colors duration-300" />
                        <div className="col-span-2 h-6 md:h-8 rounded bg-rose-400/30 group-hover:bg-rose-500/30 transition-colors duration-300" />
                        {/* Row 5 - More fading */}
                        <div className="col-span-1 h-4 md:h-6 rounded bg-pink-400/20 group-hover:bg-pink-500/20 transition-colors duration-300" />
                        <div className="col-span-2 h-4 md:h-6 rounded bg-red-400/20 group-hover:bg-red-500/20 transition-colors duration-300" />
                        <div className="col-span-1 h-4 md:h-6 rounded bg-rose-400/20 group-hover:bg-rose-500/20 transition-colors duration-300" />
                      </div>
                    </div>
                    {/* Fade out gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </article>

                <article className="relative">
                  <div className="absolute -bottom-5 md:-bottom-10 -right-5 md:-right-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10 blur-3xl" />
                  <div className="mb-8 md:mb-12 w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <Lock className="w-8 md:w-10 h-8 md:h-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                    Ambiente Seguro
                  </h3>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed mb-8 md:mb-12">
                    Desfrute de uma plataforma moderada com proteção de dados e sistema de denúncias ativo.
                  </p>
                  <div className="h-20 md:h-40 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 backdrop-blur-sm border border-violet-200 dark:border-violet-400/20 shadow-sm flex items-center justify-center group hover:scale-105 hover:shadow-lg transition-all duration-500">
                    <div className="flex items-center gap-3 group-hover:gap-4 transition-all duration-300">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-400 to-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Lock className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                      </div>
                      <div className="text-sm font-medium text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-300">
                        Segurança Garantida
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* Creative Call to Action */}
        <section
          className="min-h-screen flex items-center justify-center relative py-24 md:py-32"
          aria-labelledby="cta-heading"
        >
          {/* Final morphed circles - back to original state */}
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-[300px] md:w-[500px] lg:w-[600px] h-[300px] md:h-[500px] lg:h-[600px] rounded-full border border-gray-200 dark:border-white/10 subtle-breathe" />
            <div
              className="w-[400px] md:w-[650px] lg:w-[800px] h-[400px] md:h-[650px] lg:h-[800px] rounded-full border border-gray-100 dark:border-white/05 absolute subtle-breathe"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="w-[500px] md:w-[800px] lg:w-[1000px] h-[500px] md:h-[800px] lg:h-[1000px] rounded-full border border-gray-300 dark:border-white/03 absolute subtle-breathe"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <div className="max-w-4xl mx-auto text-center px-8 md:px-12 lg:px-16 relative z-10">
            <h2
              id="cta-heading"
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-12 md:mb-16 leading-tight text-gray-900 dark:text-white"
            >
              Pronto para{" "}
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
                Conectar
              </span>
              ?
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-white/70 mb-16 md:mb-20 leading-relaxed">
              Sua próxima grande conexão está a apenas um clique. Junte-se à comunidade OpenLove hoje.
            </p>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Link href="/auth/signup">
                <Button className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-8 md:px-12 py-6 md:py-8 text-lg md:text-2xl group">
                  Explorar Conexões
                  <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="text-gray-500 dark:text-white/50">
              <p>© 2025 OpenLove. Todos os direitos reservados.</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80 transition-colors duration-200"
              >
                Política de Privacidade
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80 transition-colors duration-200"
              >
                Termos de Serviço
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-white/10 pt-6">
            <p className="text-xs text-gray-400 dark:text-white/30">
              OpenLove - Conectando pessoas através de experiências autênticas
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
