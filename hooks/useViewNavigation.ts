import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"

/**
 * Hook para navegação entre views com sincronização de URL
 * Mantém a URL atualizada com o estado da aplicação
 */
export function useViewNavigation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  /**
   * Navega para uma view específica atualizando a URL
   * @param view - Nome da view (timeline, messages, notifications, etc)
   * @param params - Parâmetros adicionais (userId, tab, etc)
   */
  const navigateToView = useCallback((
    view: string,
    params?: Record<string, string | undefined>
  ) => {
    // Cria novos params baseados nos atuais
    const urlParams = new URLSearchParams(searchParams.toString())
    
    // Timeline é a view padrão, não precisa de param
    if (view === "timeline") {
      urlParams.delete("view")
      // Remove todos os params específicos de outras views
      urlParams.delete("userId")
      urlParams.delete("tab")
      urlParams.delete("filter")
    } else {
      // Define a view
      urlParams.set("view", view)
      
      // Remove params antigos não relacionados
      urlParams.delete("userId")
      urlParams.delete("tab")
      urlParams.delete("filter")
      
      // Adiciona novos params se fornecidos
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            urlParams.set(key, value)
          } else {
            urlParams.delete(key)
          }
        })
      }
    }
    
    // Constrói a nova URL
    const newUrl = urlParams.toString() 
      ? `${pathname}?${urlParams.toString()}` 
      : pathname
    
    // Navega sem scroll
    router.push(newUrl, { scroll: false })
  }, [searchParams, router, pathname])
  
  /**
   * Obtém o valor atual de um parâmetro da URL
   */
  const getParam = useCallback((key: string) => {
    return searchParams.get(key)
  }, [searchParams])
  
  /**
   * Obtém a view atual da URL (padrão: timeline)
   */
  const getCurrentView = useCallback(() => {
    return searchParams.get("view") || "timeline"
  }, [searchParams])
  
  /**
   * Atualiza apenas um parâmetro mantendo os outros
   */
  const updateParam = useCallback((key: string, value: string | undefined) => {
    const urlParams = new URLSearchParams(searchParams.toString())
    
    if (value !== undefined && value !== "") {
      urlParams.set(key, value)
    } else {
      urlParams.delete(key)
    }
    
    const newUrl = urlParams.toString() 
      ? `${pathname}?${urlParams.toString()}` 
      : pathname
      
    router.push(newUrl, { scroll: false })
  }, [searchParams, router, pathname])
  
  /**
   * Remove um parâmetro da URL
   */
  const removeParam = useCallback((key: string) => {
    const urlParams = new URLSearchParams(searchParams.toString())
    urlParams.delete(key)
    
    const newUrl = urlParams.toString() 
      ? `${pathname}?${urlParams.toString()}` 
      : pathname
      
    router.push(newUrl, { scroll: false })
  }, [searchParams, router, pathname])
  
  return {
    navigateToView,
    getParam,
    getCurrentView,
    updateParam,
    removeParam,
    currentView: getCurrentView(),
    userId: getParam("userId"),
    tab: getParam("tab"),
    filter: getParam("filter")
  }
}