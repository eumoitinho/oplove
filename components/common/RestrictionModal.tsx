"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  AlertTriangle, 
  Ban, 
  Clock, 
  CreditCard, 
  Shield, 
  UserX,
  Lock,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"
import { BaseModal } from "@/components/ui/base-modal"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export type RestrictionType = 
  | "age_restriction"
  | "blocked_user"
  | "rate_limit"
  | "verification_required"
  | "premium_required"
  | "content_violation"
  | "account_suspended"
  | "maintenance"
  | "region_blocked"
  | "daily_limit"

interface RestrictionConfig {
  icon: React.ElementType
  title: string
  description: string
  actions: {
    label: string
    action: () => void
    variant?: "default" | "outline" | "destructive"
  }[]
  severity: "warning" | "error" | "info"
  iconColor: string
  bgColor: string
}

interface RestrictionModalProps {
  isOpen: boolean
  onClose: () => void
  type: RestrictionType
  customMessage?: string
  metadata?: {
    retryAfter?: number // seconds
    requiredPlan?: string
    violationType?: string
    limit?: number
    used?: number
  }
}

export function RestrictionModal({
  isOpen,
  onClose,
  type,
  customMessage,
  metadata
}: RestrictionModalProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(metadata?.retryAfter || 0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  const restrictions: Record<RestrictionType, RestrictionConfig> = {
    age_restriction: {
      icon: Ban,
      title: "Conteúdo Restrito",
      description: customMessage || "Este conteúdo é restrito para maiores de 18 anos. Você deve verificar sua idade para continuar.",
      actions: [
        {
          label: "Verificar Idade",
          action: () => {
            router.push("/settings/verification")
            onClose()
          }
        },
        {
          label: "Voltar",
          action: onClose,
          variant: "outline"
        }
      ],
      severity: "error",
      iconColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    
    blocked_user: {
      icon: UserX,
      title: "Usuário Bloqueado",
      description: customMessage || "Você não pode interagir com este usuário porque um de vocês bloqueou o outro.",
      actions: [
        {
          label: "Entendi",
          action: onClose
        }
      ],
      severity: "warning",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    
    rate_limit: {
      icon: Clock,
      title: "Limite de Taxa Excedido",
      description: customMessage || `Você excedeu o limite de requisições. Tente novamente em ${Math.ceil(countdown / 60)} minutos.`,
      actions: [
        {
          label: countdown > 0 ? `Aguardar (${countdown}s)` : "Tentar Novamente",
          action: countdown > 0 ? () => {} : onClose,
          variant: countdown > 0 ? "outline" : "default"
        }
      ],
      severity: "warning",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    
    verification_required: {
      icon: Shield,
      title: "Verificação Necessária",
      description: customMessage || "Este recurso requer que sua conta seja verificada. Complete o processo de verificação para continuar.",
      actions: [
        {
          label: "Iniciar Verificação",
          action: () => {
            router.push("/settings/verification")
            onClose()
          }
        },
        {
          label: "Mais Tarde",
          action: onClose,
          variant: "outline"
        }
      ],
      severity: "info",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    
    premium_required: {
      icon: CreditCard,
      title: "Recurso Premium",
      description: customMessage || `Este recurso está disponível apenas para usuários ${metadata?.requiredPlan || 'premium'}. Faça upgrade para desbloquear.`,
      actions: [
        {
          label: "Ver Planos",
          action: () => {
            router.push("/settings/subscription")
            onClose()
          }
        },
        {
          label: "Cancelar",
          action: onClose,
          variant: "outline"
        }
      ],
      severity: "info",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    
    content_violation: {
      icon: AlertTriangle,
      title: "Violação de Conteúdo",
      description: customMessage || `Seu conteúdo viola nossas diretrizes${metadata?.violationType ? ` (${metadata.violationType})` : ''}. Por favor, revise nossas políticas.`,
      actions: [
        {
          label: "Ver Diretrizes",
          action: () => {
            router.push("/terms")
            onClose()
          }
        },
        {
          label: "Entendi",
          action: onClose,
          variant: "outline"
        }
      ],
      severity: "error",
      iconColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    
    account_suspended: {
      icon: Ban,
      title: "Conta Suspensa",
      description: customMessage || "Sua conta foi temporariamente suspensa devido a violações repetidas. Entre em contato com o suporte.",
      actions: [
        {
          label: "Contatar Suporte",
          action: () => {
            window.open("mailto:suporte@openlove.com.br", "_blank")
            onClose()
          }
        }
      ],
      severity: "error",
      iconColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    
    maintenance: {
      icon: AlertCircle,
      title: "Em Manutenção",
      description: customMessage || "Este recurso está temporariamente em manutenção. Por favor, tente novamente mais tarde.",
      actions: [
        {
          label: "OK",
          action: onClose
        }
      ],
      severity: "info",
      iconColor: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/20"
    },
    
    region_blocked: {
      icon: Lock,
      title: "Região Bloqueada",
      description: customMessage || "Este conteúdo não está disponível em sua região devido a restrições legais.",
      actions: [
        {
          label: "Entendi",
          action: onClose
        }
      ],
      severity: "warning",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    
    daily_limit: {
      icon: Clock,
      title: "Limite Diário Atingido",
      description: customMessage || `Você atingiu o limite diário${metadata?.limit ? ` (${metadata.used}/${metadata.limit})` : ''}. Faça upgrade para aumentar seus limites.`,
      actions: [
        {
          label: "Fazer Upgrade",
          action: () => {
            router.push("/settings/subscription")
            onClose()
          }
        },
        {
          label: "OK",
          action: onClose,
          variant: "outline"
        }
      ],
      severity: "warning",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    }
  }

  const config = restrictions[type]
  const Icon = config.icon

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      variant="centered"
      className="max-w-md"
    >
      <div className="text-center">
        {/* Icon with background */}
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
          config.bgColor
        )}>
          <Icon className={cn("w-8 h-8", config.iconColor)} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {config.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {config.description}
        </p>

        {/* Additional info based on type */}
        {type === "rate_limit" && countdown > 0 && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tente novamente em: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        {type === "daily_limit" && metadata?.limit && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (metadata.used! / metadata.limit) * 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {metadata.used} de {metadata.limit} usados hoje
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {config.actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant={action.variant || "default"}
              disabled={type === "rate_limit" && countdown > 0 && index === 0}
              className={cn(
                "min-w-[120px]",
                action.variant === "default" && "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              )}
            >
              {action.label}
            </Button>
          ))}
        </div>

        {/* Help text */}
        {type === "content_violation" && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Violações repetidas podem resultar em suspensão permanente
          </p>
        )}

        {type === "premium_required" && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Usuários premium têm acesso a recursos exclusivos e limites maiores
          </p>
        )}
      </div>
    </BaseModal>
  )
}

// Hook for using restriction modals
export function useRestrictionModal() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: RestrictionType
    customMessage?: string
    metadata?: any
  }>({
    isOpen: false,
    type: "age_restriction"
  })

  const showRestriction = (
    type: RestrictionType, 
    customMessage?: string,
    metadata?: any
  ) => {
    setModalState({
      isOpen: true,
      type,
      customMessage,
      metadata
    })
  }

  const hideRestriction = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  const RestrictionModalComponent = () => (
    <RestrictionModal
      isOpen={modalState.isOpen}
      onClose={hideRestriction}
      type={modalState.type}
      customMessage={modalState.customMessage}
      metadata={modalState.metadata}
    />
  )

  return {
    showRestriction,
    hideRestriction,
    RestrictionModal: RestrictionModalComponent
  }
}