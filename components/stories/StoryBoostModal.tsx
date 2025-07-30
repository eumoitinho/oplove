"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Clock, Users } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useUserCredits } from '@/hooks/useUserCredits'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface StoryBoostModalProps {
  isOpen: boolean
  onClose: () => void
  onBoost: (credits: number, duration: number) => void
  storyId: string
}

const BOOST_OPTIONS = [
  {
    duration: 6,
    credits: 50,
    name: '6 horas',
    description: 'Ótimo para testar',
    estimatedReach: '500-1000 visualizações'
  },
  {
    duration: 12,
    credits: 90,
    name: '12 horas',
    description: 'Recomendado',
    estimatedReach: '1000-2000 visualizações',
    popular: true
  },
  {
    duration: 24,
    credits: 150,
    name: '24 horas',
    description: 'Máximo alcance',
    estimatedReach: '2000-5000 visualizações'
  }
]

export default function StoryBoostModal({
  isOpen,
  onClose,
  onBoost,
  storyId
}: StoryBoostModalProps) {
  const { credits, loading: creditsLoading } = useUserCredits()
  const [selectedOption, setSelectedOption] = useState(BOOST_OPTIONS[1])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBoost = async () => {
    if (!credits || credits.creditBalance < selectedOption.credits) {
      toast.error('Créditos insuficientes')
      return
    }

    setIsProcessing(true)
    try {
      await onBoost(selectedOption.credits, selectedOption.duration)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Zap className="w-5 h-5 text-yellow-500 mr-2" />
            Impulsionar Story
          </DialogTitle>
          <DialogDescription>
            Aumente o alcance do seu story e apareça primeiro na lista
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current credits */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Seus créditos
              </span>
              <span className="font-semibold text-lg">
                {creditsLoading ? '...' : credits?.creditBalance || 0} créditos
              </span>
            </div>
          </div>

          {/* Boost options */}
          <RadioGroup
            value={selectedOption.duration.toString()}
            onValueChange={(value) => {
              const option = BOOST_OPTIONS.find(o => o.duration.toString() === value)
              if (option) setSelectedOption(option)
            }}
          >
            <div className="space-y-3">
              {BOOST_OPTIONS.map((option) => (
                <label
                  key={option.duration}
                  className={cn(
                    "relative flex cursor-pointer rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    selectedOption.duration === option.duration && "border-purple-600 bg-purple-50 dark:bg-purple-900/20",
                    option.popular && "ring-2 ring-purple-600 ring-offset-2"
                  )}
                >
                  <RadioGroupItem 
                    value={option.duration.toString()} 
                    className="sr-only" 
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold flex items-center">
                          {option.name}
                          {option.popular && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                              Popular
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {option.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{option.credits}</p>
                        <p className="text-sm text-gray-500">créditos</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      {option.estimatedReach}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>

          {/* Benefits */}
          <div className="space-y-2">
            <p className="font-medium">Benefícios do impulso:</p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                Apareça primeiro na lista de stories
              </li>
              <li className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                Indicador especial de story impulsionado
              </li>
              <li className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                Duração estendida além das 24h padrão
              </li>
            </ul>
          </div>

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
              onClick={handleBoost}
              disabled={isProcessing || !credits || credits.creditBalance < selectedOption.credits}
              className="flex-1"
            >
              {isProcessing ? (
                'Processando...'
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Impulsionar por {selectedOption.credits} créditos
                </>
              )}
            </Button>
          </div>

          {/* Insufficient credits warning */}
          {credits && credits.creditBalance < selectedOption.credits && (
            <p className="text-sm text-red-600 text-center">
              Você precisa de mais {selectedOption.credits - credits.creditBalance} créditos
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}