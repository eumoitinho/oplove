"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, Heart, Star, Sparkles } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserCredits } from '@/hooks/useUserCredits'
import { ProfileSeal } from '@/types/database.types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ProfileSealsModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
}

const SEAL_CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Sparkles },
  { id: 'romantic', name: 'Romântico', icon: Heart },
  { id: 'fun', name: 'Divertido', icon: Star },
  { id: 'premium', name: 'Premium', icon: Gift }
]

export default function ProfileSealsModal({
  isOpen,
  onClose,
  recipientId,
  recipientName
}: ProfileSealsModalProps) {
  const { credits, loading: creditsLoading } = useUserCredits()
  const [seals, setSeals] = useState<ProfileSeal[]>([])
  const [selectedSeal, setSelectedSeal] = useState<ProfileSeal | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSeals()
  }, [])

  const loadSeals = async () => {
    try {
      const response = await fetch('/api/v1/seals', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSeals(data.seals)
      }
    } catch (error) {
      console.error('Error loading seals:', error)
      toast.error('Erro ao carregar selos')
    } finally {
      setLoading(false)
    }
  }

  const handleGiftSeal = async () => {
    if (!selectedSeal || !credits) return

    if (credits.creditBalance < selectedSeal.creditCost) {
      toast.error('Créditos insuficientes')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/v1/seals/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipientId,
          sealId: selectedSeal.id,
          message: message.trim()
        })
      })

      if (response.ok) {
        toast.success(`Selo enviado para ${recipientName}!`)
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao enviar selo')
      }
    } catch (error) {
      console.error('Error gifting seal:', error)
      toast.error('Erro ao enviar selo')
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredSeals = selectedCategory === 'all' 
    ? seals 
    : seals.filter(seal => seal.category === selectedCategory)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Gift className="w-5 h-5 text-purple-600 mr-2" />
            Enviar Selo para {recipientName}
          </DialogTitle>
          <DialogDescription>
            Escolha um selo especial para presentear
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current credits */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Seus créditos
              </span>
              <span className="font-semibold">
                {creditsLoading ? '...' : credits?.creditBalance || 0} créditos
              </span>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {SEAL_CATEGORIES.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex-shrink-0"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {category.name}
                </Button>
              )
            })}
          </div>

          {/* Seals grid */}
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredSeals.map((seal) => (
                  <motion.button
                    key={seal.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSeal(seal)}
                    className={cn(
                      "relative aspect-square rounded-lg border-2 p-4 transition-all",
                      selectedSeal?.id === seal.id 
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" 
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <div className="relative w-12 h-12">
                        <Image
                          src={seal.iconUrl}
                          alt={seal.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <p className="text-xs font-medium text-center line-clamp-2">
                        {seal.name}
                      </p>
                      <p className="text-xs font-semibold text-purple-600">
                        {seal.creditCost} créditos
                      </p>
                    </div>
                    
                    {seal.timesGifted > 100 && (
                      <div className="absolute top-1 right-1 bg-yellow-400 text-black text-xs px-1 rounded">
                        Popular
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selected seal details */}
          {selectedSeal && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={selectedSeal.iconUrl}
                    alt={selectedSeal.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{selectedSeal.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedSeal.description}
                  </p>
                  <p className="text-sm font-medium text-purple-600 mt-1">
                    {selectedSeal.creditCost} créditos
                  </p>
                </div>
              </div>
              
              {/* Message input */}
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Adicione uma mensagem especial (opcional)..."
                rows={2}
                maxLength={200}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGiftSeal}
              disabled={
                !selectedSeal || 
                isProcessing || 
                !credits || 
                credits.creditBalance < (selectedSeal?.creditCost || 0)
              }
              className="flex-1"
            >
              {isProcessing ? (
                'Enviando...'
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Enviar por {selectedSeal?.creditCost || 0} créditos
                </>
              )}
            </Button>
          </div>

          {/* Insufficient credits warning */}
          {selectedSeal && credits && credits.creditBalance < selectedSeal.creditCost && (
            <p className="text-sm text-red-600 text-center">
              Você precisa de mais {selectedSeal.creditCost - credits.creditBalance} créditos
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}