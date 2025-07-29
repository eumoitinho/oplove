"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PollOption {
  id: string
  text: string
}

interface Poll {
  question: string
  options: PollOption[]
  duration: number // in hours
  allowMultiple?: boolean
}

interface PollCreatorProps {
  poll: Poll
  onChange: (poll: Poll) => void
  onRemove: () => void
  className?: string
}

const durationOptions = [
  { value: 1, label: "1 hora" },
  { value: 6, label: "6 horas" },
  { value: 12, label: "12 horas" },
  { value: 24, label: "1 dia" },
  { value: 72, label: "3 dias" },
  { value: 168, label: "1 semana" },
]

export function PollCreator({ poll, onChange, onRemove, className }: PollCreatorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateQuestion = (question: string) => {
    onChange({ ...poll, question })
    if (errors.question) {
      setErrors((prev) => ({ ...prev, question: "" }))
    }
  }

  const updateOption = (index: number, text: string) => {
    const newOptions = [...poll.options]
    newOptions[index] = { ...newOptions[index], text }
    onChange({ ...poll, options: newOptions })

    if (errors[`option-${index}`]) {
      setErrors((prev) => ({ ...prev, [`option-${index}`]: "" }))
    }
  }

  const addOption = () => {
    if (poll.options.length >= 4) return

    const newOption: PollOption = {
      id: `option-${Date.now()}`,
      text: "",
    }
    onChange({ ...poll, options: [...poll.options, newOption] })
  }

  const removeOption = (index: number) => {
    if (poll.options.length <= 2) return

    const newOptions = poll.options.filter((_, i) => i !== index)
    onChange({ ...poll, options: newOptions })
  }

  const updateDuration = (duration: number) => {
    onChange({ ...poll, duration })
  }

  const validatePoll = () => {
    const newErrors: Record<string, string> = {}

    if (!poll.question.trim()) {
      newErrors.question = "Pergunta é obrigatória"
    }

    poll.options.forEach((option, index) => {
      if (!option.text.trim()) {
        newErrors[`option-${index}`] = "Opção não pode estar vazia"
      }
    })

    // Check for duplicate options
    const optionTexts = poll.options.map((o) => o.text.trim().toLowerCase())
    const duplicates = optionTexts.filter((text, index) => text && optionTexts.indexOf(text) !== index)

    if (duplicates.length > 0) {
      poll.options.forEach((option, index) => {
        if (duplicates.includes(option.text.trim().toLowerCase())) {
          newErrors[`option-${index}`] = "Opções duplicadas não são permitidas"
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <Card className={cn("border border-purple-200 bg-purple-50/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Criar Enquete</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Input */}
        <div className="space-y-2">
          <Label htmlFor="poll-question">Pergunta</Label>
          <Input
            id="poll-question"
            placeholder="Faça uma pergunta..."
            value={poll.question}
            onChange={(e) => updateQuestion(e.target.value)}
            className={cn("bg-white", errors.question && "border-red-500 focus-visible:ring-red-500")}
            maxLength={120}
          />
          {errors.question && <p className="text-sm text-red-600">{errors.question}</p>}
          <p className="text-xs text-gray-500">{poll.question.length}/120 caracteres</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label>Opções</Label>
          <AnimatePresence>
            {poll.options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="flex-1">
                  <Input
                    placeholder={`Opção ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className={cn("bg-white", errors[`option-${index}`] && "border-red-500 focus-visible:ring-red-500")}
                    maxLength={50}
                  />
                  {errors[`option-${index}`] && (
                    <p className="text-sm text-red-600 mt-1">{errors[`option-${index}`]}</p>
                  )}
                </div>

                {poll.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Option Button */}
          {poll.options.length < 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar opção
            </Button>
          )}
        </div>

        {/* Duration Selector */}
        <div className="space-y-2">
          <Label>Duração da enquete</Label>
          <Select value={poll.duration.toString()} onValueChange={(value) => updateDuration(Number.parseInt(value))}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Poll Preview */}
        <div className="bg-white p-3 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">Prévia</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">{poll.question || "Sua pergunta aparecerá aqui..."}</p>
            <div className="space-y-1">
              {poll.options.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-sm">
                  <div className="w-4 h-4 border border-gray-300 rounded-full" />
                  <span className="text-gray-600">{option.text || `Opção ${index + 1}`}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Enquete encerra em {durationOptions.find((d) => d.value === poll.duration)?.label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
