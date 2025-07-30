"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Shield, 
  Eye,
  RefreshCw,
  User,
  CreditCard
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { notification } from "@/lib/services/notification-service"
import { FaceScanCapture } from "./FaceScanCapture"
import { DocumentUpload } from "./DocumentUpload"
import { LivenessDetection } from "./LivenessDetection"

type VerificationStep = "info" | "document" | "selfie" | "facescan" | "review" | "complete"
type DocumentType = "rg" | "cnh" | "passport" | "cpf"

interface VerificationData {
  // Personal Info
  fullName: string
  cpf: string
  birthDate: string
  documentType: DocumentType
  documentNumber: string
  
  // Files
  documentFront?: File
  documentBack?: File
  selfiePhoto?: File
  faceScanData?: any
  
  // Verification status
  step: VerificationStep
  isVerified: boolean
}

export function VerificationForm() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<VerificationStep>("info")
  const [isProcessing, setIsProcessing] = useState(false)
  const [verificationData, setVerificationData] = useState<VerificationData>({
    fullName: user?.name || "",
    cpf: "",
    birthDate: "",
    documentType: "rg",
    documentNumber: "",
    step: "info",
    isVerified: false
  })

  const steps = [
    { id: "info", label: "Informações", icon: User },
    { id: "document", label: "Documento", icon: FileText },
    { id: "selfie", label: "Selfie", icon: Camera },
    { id: "facescan", label: "FaceScan 3D", icon: Eye },
    { id: "review", label: "Revisão", icon: CheckCircle },
  ]

  const handleStepComplete = (stepData: any) => {
    setVerificationData(prev => ({ ...prev, ...stepData }))
    
    // Advance to next step
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id as VerificationStep
      setCurrentStep(nextStep)
    }
  }

  const submitVerification = async () => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      
      // Add text data
      formData.append('fullName', verificationData.fullName)
      formData.append('cpf', verificationData.cpf)
      formData.append('birthDate', verificationData.birthDate)
      formData.append('documentType', verificationData.documentType)
      formData.append('documentNumber', verificationData.documentNumber)
      
      // Add files
      if (verificationData.documentFront) {
        formData.append('documentFront', verificationData.documentFront)
      }
      if (verificationData.documentBack) {
        formData.append('documentBack', verificationData.documentBack)
      }
      if (verificationData.selfiePhoto) {
        formData.append('selfiePhoto', verificationData.selfiePhoto)
      }
      if (verificationData.faceScanData) {
        formData.append('faceScanData', JSON.stringify(verificationData.faceScanData))
      }

      const response = await fetch('/api/v1/verification/submit', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setCurrentStep("complete")
        notification.success("Verificação enviada com sucesso! Você receberá o resultado em até 48h.")
      } else {
        throw new Error("Erro ao enviar verificação")
      }
    } catch (error) {
      notification.error("Erro ao processar verificação. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "info":
        return (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Informações Pessoais</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={verificationData.fullName}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Seu nome completo como no documento"
                />
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={verificationData.cpf}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={verificationData.birthDate}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Tipo de Documento</Label>
                <Select
                  value={verificationData.documentType}
                  onValueChange={(value) => setVerificationData(prev => ({ ...prev, documentType: value as DocumentType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rg">RG - Registro Geral</SelectItem>
                    <SelectItem value="cnh">CNH - Carteira de Motorista</SelectItem>
                    <SelectItem value="passport">Passaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="documentNumber">Número do Documento</Label>
                <Input
                  id="documentNumber"
                  value={verificationData.documentNumber}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, documentNumber: e.target.value }))}
                  placeholder="Número do documento selecionado"
                />
              </div>
              
              <Button 
                onClick={() => handleStepComplete({})}
                disabled={!verificationData.fullName || !verificationData.cpf || !verificationData.birthDate}
                className="w-full"
              >
                Continuar
              </Button>
            </div>
          </Card>
        )
        
      case "document":
        return (
          <DocumentUpload
            documentType={verificationData.documentType}
            onComplete={(files) => handleStepComplete(files)}
          />
        )
        
      case "selfie":
        return (
          <LivenessDetection
            onComplete={(selfieData) => handleStepComplete(selfieData)}
          />
        )
        
      case "facescan":
        return (
          <FaceScanCapture
            onComplete={(faceScanData) => handleStepComplete({ faceScanData })}
          />
        )
        
      case "review":
        return (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Revisão dos Dados</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Nome:</span>
                  <p className="font-medium">{verificationData.fullName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">CPF:</span>
                  <p className="font-medium">{verificationData.cpf}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Documento:</span>
                  <p className="font-medium">{verificationData.documentType.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Pronto para envio</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  O que acontece agora?
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Sua verificação será analisada em até 48 horas</li>
                  <li>• Você receberá uma notificação com o resultado</li>
                  <li>• Após aprovação, você ganhará o selo de verificado</li>
                  <li>• Recursos premium serão desbloqueados automaticamente</li>
                </ul>
              </div>
              
              <Button 
                onClick={submitVerification}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Enviar Verificação
                  </>
                )}
              </Button>
            </div>
          </Card>
        )
        
      case "complete":
        return (
          <Card className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Verificação Enviada!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sua verificação foi enviada com sucesso. Você receberá o resultado em até 48 horas.
            </p>
            <Badge variant="secondary" className="mb-4">
              Em análise
            </Badge>
            <Button 
              onClick={() => window.location.href = '/feed'}
              className="w-full"
            >
              Voltar ao Feed
            </Button>
          </Card>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index
            const Icon = step.icon
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${isActive ? 'border-purple-500 bg-purple-500 text-white' : ''}
                  ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'border-gray-300 text-gray-400' : ''}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-purple-600' : 
                  isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  )
}