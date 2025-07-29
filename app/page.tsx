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

export default function LunchBoxLanding() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringDesignElement, setIsHoveringDesignElement] = useState(false)
  const scrollRef = useRef<NodeJS.Timeout | null>(null)
  const mouseRef = useRef<NodeJS.Timeout | null>(null)

  // Check system preference on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
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
          background: ${isDarkMode ? "rgba(168, 85, 247, 0.3)" : "rgba(147, 51, 234, 0.2)"};
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
          background: ${isDarkMode ? "rgba(168, 85, 247, 0.3)" : "rgba(147, 51, 234, 0.3)"};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "rgba(168, 85, 247, 0.5)" : "rgba(147, 51, 234, 0.5)"};
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
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.15),rgba(0,0,0,0))]" />
      <div className="fixed top-0 left-0 w-full h-full">
        <div className="absolute top-[10%] left-[5%] w-32 md:w-64 h-32 md:h-64 rounded-full bg-gradient-to-r from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10 blur-3xl subtle-breathe" />
        <div
          className="absolute top-[40%] right-[10%] w-40 md:w-80 h-40 md:h-80 rounded-full bg-gradient-to-r from-pink-500/5 to-orange-500/5 dark:from-pink-500/10 dark:to-orange-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] w-36 md:w-72 h-36 md:h-72 rounded-full bg-gradient-to-r from-green-500/5 to-cyan-500/5 dark:from-green-500/10 dark:to-cyan-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
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
            <Button
              variant="ghost"
              className="text-sm md:text-lg font-light text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 px-2 md:px-4"
              onClick={() =>
                window.open("https://www.lunch-box.co/modern-bento-grid-presentation-deck-template/edit", "_blank")
              }
            >
              Peek Inside
            </Button>
            <Button
              variant="ghost"
              className="text-sm md:text-lg font-light text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 px-2 md:px-4"
              onClick={() => window.open("https://www.lunch-box.co/free-bento-grid-templates", "_blank")}
            >
              Get Inspired
            </Button>
            <Button
              variant="ghost"
              className="text-sm md:text-lg font-light text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-300 px-2 md:px-4"
              onClick={() => (window.location.href = "/timeline")}
            >
              Community
            </Button>
            <Button
              className="rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90 px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-base hover:scale-105 transition-all duration-300 hover:shadow-lg"
              onClick={() => window.open("https://www.lunch-box.co/new", "_blank")}
            >
              Make Magic
            </Button>
          </div>
        </nav>

        {/* Creative Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-8 md:px-12 lg:px-16 relative">
          {/* Morphing Circles/Squares - simplified with CSS variables */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] lg:w-[800px] h-[400px] md:h-[600px] lg:h-[800px] border border-gray-200 dark:border-white/5 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation})`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[450px] lg:w-[600px] h-[300px] md:h-[450px] lg:h-[600px] border border-gray-200 dark:border-white/10 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation === "0deg" ? "0deg" : `-${rotation}`})`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[300px] lg:w-[400px] h-[200px] md:h-[300px] lg:h-[400px] border border-gray-300 dark:border-white/20 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation === "0deg" ? "0deg" : `${Number.parseFloat(rotation) * 0.5}deg`})`,
            }}
          />

          <div className="max-w-6xl mx-auto text-center relative">
            <Badge
              variant="outline"
              className="hidden md:inline-flex mb-8 md:mb-12 text-xs md:text-sm font-light border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/80 px-3 md:px-4 py-1.5 md:py-2 items-center"
            >
              <Sparkles className="w-3 h-3 mr-2" />
              CSS? Never heard of her
            </Badge>

            <h1 className="text-[6rem] md:text-[10rem] lg:text-[12rem] font-bold leading-none tracking-tighter mb-8 md:mb-12 group cursor-default">
              <span className="block text-gray-900 dark:text-white group-hover:tracking-wide transition-all duration-500">
                lunch
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 bg-clip-text text-transparent group-hover:tracking-wide transition-all duration-500">
                box
              </span>
            </h1>

            <p className="text-lg md:text-2xl lg:text-3xl text-gray-700 dark:text-white/80 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed font-light">
              Create stunning bento grid layouts that make your content shine. No coding required.
            </p>

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-500 dark:via-pink-500 dark:to-cyan-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Button
                className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-6 md:px-8 py-4 md:py-6 text-lg md:text-xl group"
                onClick={() => window.open("https://www.lunch-box.co/new", "_blank")}
              >
                Start Building Your Grid
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
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
                  Design like a{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    wizard
                  </span>
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-white/70 mb-8 md:mb-12 leading-relaxed">
                  Drag and drop content into beautiful bento grid layouts. Create professional-looking designs in
                  minutes, not hours.
                </p>
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="w-16 md:w-20 h-[2px] bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400" />
                  <p className="text-sm md:text-base text-gray-500 dark:text-white/50">
                    Perfect for portfolios, blogs, and showcases
                  </p>
                </div>
              </div>

              {/* Right Column - Bento Preview */}
              <div className="lg:col-span-7 relative">
                <div className="absolute -top-10 md:-top-20 -left-10 md:-left-20 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 blur-3xl" />
                <div className="absolute -bottom-10 md:-bottom-20 -right-10 md:-right-20 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 blur-3xl" />

                <div
                  className="grid grid-cols-4 grid-rows-4 gap-3 md:gap-4 h-[400px] md:h-[500px] lg:h-[600px] relative"
                  onMouseEnter={() => setIsHoveringDesignElement(true)}
                  onMouseLeave={() => setIsHoveringDesignElement(false)}
                >
                  {/* Hero Box - Stories (emphasized with special styling) */}
                  <div className="col-span-2 row-span-2 rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/15 dark:to-pink-500/15 backdrop-blur-sm border-2 border-purple-300/50 dark:border-purple-400/30 p-4 md:p-6 transition-all duration-500 flex flex-col justify-between shadow-lg group hover:scale-[1.02] hover:shadow-xl hover:border-purple-400/70 dark:hover:border-purple-400/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">FEATURED</span>
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white relative z-10">
                      Stories
                    </h3>
                  </div>

                  <div className="col-span-2 row-span-1 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-3 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.02] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-blue-300 dark:hover:border-blue-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-lg md:text-2xl font-medium text-gray-900 dark:text-white relative z-10">
                      Portfolios
                    </h3>
                  </div>

                  <div className="col-span-1 row-span-1 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-2 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.05] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-green-300 dark:hover:border-green-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-sm md:text-xl font-medium text-gray-900 dark:text-white relative z-10">
                      Blogs
                    </h3>
                  </div>

                  <div className="col-span-1 row-span-2 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-2 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.05] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-orange-300 dark:hover:border-orange-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-sm md:text-xl font-medium text-gray-900 dark:text-white relative z-10">
                      Galleries
                    </h3>
                  </div>

                  <div className="col-span-2 row-span-1 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-3 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.02] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-cyan-300 dark:hover:border-cyan-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-lg md:text-2xl font-medium text-gray-900 dark:text-white relative z-10">
                      Showcases
                    </h3>
                  </div>

                  <div className="col-span-1 row-span-1 rounded-2xl md:rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-2 md:p-6 transition-all duration-500 flex items-end shadow-sm group hover:scale-[1.05] hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:border-pink-300 dark:hover:border-pink-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 dark:from-pink-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-sm md:text-xl font-medium text-gray-900 dark:text-white relative z-10">
                      Moodboards
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
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Superpowers
                </span>{" "}
                included
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-white/70 leading-relaxed">
                Everything you need to create stunning bento grid layouts without learning or spending on a deisgn tool.
              </p>
            </div>

            <div className="relative">
              {/* Artistic Feature Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 lg:gap-28">
                <article className="relative">
                  <div className="absolute -top-5 md:-top-10 -left-5 md:-left-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 blur-3xl" />
                  <div className="mb-8 md:mb-12 w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <Grid3X3 className="w-8 md:w-10 h-8 md:h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                    Responsive Grid System
                  </h3>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed mb-8 md:mb-12">
                    Automatically adapts to any screen size. Your bento grids look perfect on desktop, tablet, and
                    mobile devices.
                  </p>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="h-16 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/15 dark:to-pink-500/15 backdrop-blur-sm border border-purple-200 dark:border-purple-400/20 shadow-sm flex items-center justify-center group hover:scale-105 hover:-rotate-1 hover:shadow-lg transition-all duration-500">
                      <div className="grid grid-cols-2 gap-1 group-hover:gap-1.5 transition-all duration-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-sm group-hover:bg-purple-500 transition-colors duration-300" />
                        <div className="w-2 h-2 bg-pink-400 rounded-sm group-hover:bg-pink-500 transition-colors duration-300" />
                        <div className="w-2 h-2 bg-pink-400 rounded-sm group-hover:bg-pink-500 transition-colors duration-300" />
                        <div className="w-2 h-2 bg-purple-400 rounded-sm group-hover:bg-purple-500 transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="h-16 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 dark:from-pink-500/15 dark:to-orange-500/15 backdrop-blur-sm border border-pink-200 dark:border-pink-400/20 shadow-sm flex items-center justify-center group hover:scale-105 hover:shadow-lg transition-all duration-500 delay-75">
                      <div className="grid grid-cols-3 gap-1 group-hover:gap-1.5 transition-all duration-300">
                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-sm group-hover:bg-pink-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-sm group-hover:bg-orange-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-sm group-hover:bg-pink-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-sm group-hover:bg-orange-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-sm group-hover:bg-pink-500 transition-colors duration-300" />
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-sm group-hover:bg-orange-500 transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="h-16 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 dark:from-orange-500/15 dark:to-yellow-500/15 backdrop-blur-sm border border-orange-200 dark:border-orange-400/20 shadow-sm flex items-center justify-center group hover:scale-105 hover:rotate-1 hover:shadow-lg transition-all duration-500 delay-150">
                      <Layers className="w-6 h-6 text-orange-500 group-hover:text-orange-600 group-hover:scale-110 transition-all duration-300" />
                    </div>
                  </div>
                </article>

                <article className="relative">
                  <div className="absolute -top-5 md:-top-10 -right-5 md:-right-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 blur-3xl" />
                  <div className="mb-8 md:mb-12 w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <Zap className="w-8 md:w-10 h-8 md:h-10 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                    Multi-Media Support
                  </h3>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed mb-8 md:mb-12">
                    Add images, videos, text, and embed interactive content. Support for all major file formats and
                    media types.
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="h-24 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/15 dark:to-blue-500/15 backdrop-blur-sm border border-cyan-200 dark:border-cyan-400/20 shadow-sm flex flex-col items-center justify-center gap-2 group hover:scale-105 hover:-rotate-1 hover:shadow-lg transition-all duration-500">
                      <div className="flex gap-2 group-hover:gap-3 transition-all duration-300">
                        <ImageIcon className="w-4 h-4 text-cyan-500 group-hover:text-cyan-600 group-hover:scale-110 transition-all duration-300" />
                        <Video className="w-4 h-4 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300 delay-75" />
                      </div>
                      <div className="w-8 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full group-hover:w-10 transition-all duration-300" />
                    </div>
                    <div className="h-24 md:h-36 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/15 dark:to-indigo-500/15 backdrop-blur-sm border border-blue-200 dark:border-blue-400/20 shadow-sm flex flex-col items-center justify-center gap-2 group hover:scale-105 hover:rotate-1 hover:shadow-lg transition-all duration-500 delay-75">
                      <div className="flex gap-2 group-hover:gap-3 transition-all duration-300">
                        <FileText className="w-4 h-4 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
                        <Music className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300 delay-75" />
                      </div>
                      <div className="w-6 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full group-hover:w-8 transition-all duration-300" />
                    </div>
                  </div>
                </article>

                <article className="relative group">
                  <div className="absolute -bottom-5 md:-bottom-10 -left-5 md:-left-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 blur-3xl" />
                  <div className="mb-8 md:mb-12 w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <Infinity className="w-8 md:w-10 h-8 md:h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                    Infinite Layouts
                  </h3>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed mb-8 md:mb-12">
                    Create unlimited content arrangements. Our smart algorithm automatically organizes your content
                    beautifully.
                  </p>
                  <div className="relative h-32 md:h-40 overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-b from-green-500/10 via-emerald-500/10 to-transparent dark:from-green-500/15 dark:via-emerald-500/15 dark:to-transparent backdrop-blur-sm border border-green-200 dark:border-green-400/20 shadow-sm">
                    {/* Infinite bento grid extending downward */}
                    <div className="absolute inset-0 p-2 md:p-3">
                      <div className="grid grid-cols-4 gap-1 md:gap-1.5 h-full">
                        {/* Row 1 */}
                        <div className="col-span-2 h-6 md:h-8 rounded bg-green-400/60 group-hover:bg-green-500/60 transition-colors duration-300" />
                        <div className="col-span-1 h-6 md:h-8 rounded bg-emerald-400/60 group-hover:bg-emerald-500/60 transition-colors duration-300" />
                        <div className="col-span-1 h-6 md:h-8 rounded bg-teal-400/60 group-hover:bg-teal-500/60 transition-colors duration-300" />

                        {/* Row 2 */}
                        <div className="col-span-1 h-6 md:h-8 rounded bg-emerald-400/50 group-hover:bg-emerald-500/50 transition-colors duration-300" />
                        <div className="col-span-3 h-6 md:h-8 rounded bg-green-400/50 group-hover:bg-green-500/50 transition-colors duration-300" />

                        {/* Row 3 */}
                        <div className="col-span-3 h-6 md:h-8 rounded bg-teal-400/40 group-hover:bg-teal-500/40 transition-colors duration-300" />
                        <div className="col-span-1 h-6 md:h-8 rounded bg-green-400/40 group-hover:bg-green-500/40 transition-colors duration-300" />

                        {/* Row 4 - Fading */}
                        <div className="col-span-2 h-6 md:h-8 rounded bg-emerald-400/30 group-hover:bg-emerald-500/30 transition-colors duration-300" />
                        <div className="col-span-2 h-6 md:h-8 rounded bg-green-400/30 group-hover:bg-green-500/30 transition-colors duration-300" />

                        {/* Row 5 - More fading */}
                        <div className="col-span-1 h-4 md:h-6 rounded bg-teal-400/20 group-hover:bg-teal-500/20 transition-colors duration-300" />
                        <div className="col-span-2 h-4 md:h-6 rounded bg-emerald-400/20 group-hover:bg-emerald-500/20 transition-colors duration-300" />
                        <div className="col-span-1 h-4 md:h-6 rounded bg-green-400/20 group-hover:bg-green-500/20 transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Fade out gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </article>

                <article className="relative">
                  <div className="absolute -bottom-5 md:-bottom-10 -right-5 md:-right-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-gradient-to-r from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10 blur-3xl" />
                  <div className="mb-8 md:mb-12 w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 backdrop-blur-sm border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500" />
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
                    One-Click Publishing
                  </h3>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed mb-8 md:mb-12">
                    Deploy your bento grid instantly to the web. Share your creations with custom URLs and SEO
                    optimization.
                  </p>
                  <div className="h-20 md:h-40 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/15 dark:to-red-500/15 backdrop-blur-sm border border-orange-200 dark:border-orange-400/20 shadow-sm flex items-center justify-center group hover:scale-105 hover:shadow-lg transition-all duration-500">
                    <div className="flex items-center gap-3 group-hover:gap-4 transition-all duration-300">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Zap className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                      </div>
                      <div className="text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300">
                        Instant Deploy
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
              className="w-[400px] md:w-[650px] lg:w-[800px] h-[400px] md:h-[650px] lg:h-[800px] rounded-full border border-gray-100 dark:border-white/5 absolute subtle-breathe"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="w-[500px] md:w-[800px] lg:w-[1000px] h-[500px] md:h-[800px] lg:h-[1000px] rounded-full border border-gray-300 dark:border-white/3 absolute subtle-breathe"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <div className="max-w-4xl mx-auto text-center px-8 md:px-12 lg:px-16 relative z-10">
            <h2
              id="cta-heading"
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-12 md:mb-16 leading-tight text-gray-900 dark:text-white"
            >
              Time to{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Play
              </span>
              ?
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-white/70 mb-16 md:mb-20 leading-relaxed">
              Your content deserves better than that sad folder it's rotting in. Let's fix that.
            </p>

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-500 dark:via-pink-500 dark:to-cyan-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <Button
                className="rounded-full bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-black/90 px-8 md:px-12 py-6 md:py-8 text-lg md:text-2xl group"
                onClick={() => window.open("https://www.lunch-box.co/new", "_blank")}
              >
                Make Something Cool
                <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
