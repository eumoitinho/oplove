"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  RotateCcw,
  X,
  CreditCard
} from "lucide-react"
import { notification } from "@/lib/services/notification-service"
import Image from "next/image"

interface DocumentUploadProps {
  documentType: "rg" | "cnh" | "passport" | "cpf"
  onComplete: (files: { documentFront?: File, documentBack?: File }) => void
}

interface UploadedDocument {
  file: File
  preview: string
  side: "front" | "back"
  isValid: boolean
  confidence?: number
}

export function DocumentUpload({ documentType, onComplete }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentUpload, setCurrentUpload] = useState<"front" | "back" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const documentConfig = {
    rg: {
      name: "RG - Registro Geral",
      needsBothSides: true,
      frontLabel: "Frente do RG",
      backLabel: "Verso do RG",
      tips: [
        "Certifique-se de que todos os dados estão visíveis",
        "Evite reflexos e sombras",
        "Mantenha o documento reto e completo na imagem"
      ]
    },
    cnh: {
      name: "CNH - Carteira de Motorista",
      needsBothSides: true,
      frontLabel: "Frente da CNH",
      backLabel: "Verso da CNH",
      tips: [
        "Foto deve estar nítida e legível",
        "Capture todo o documento",
        "Evite brilho no plástico"
      ]
    },
    passport: {
      name: "Passaporte",
      needsBothSides: false,
      frontLabel: "Página com foto do Passaporte",
      backLabel: "",
      tips: [
        "Abra na página com sua foto",
        "Certifique-se de que está completamente aberto",
        "Todos os dados devem estar legíveis"
      ]
    }
  }

  const config = documentConfig[documentType]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, source: "upload" | "camera") => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      notification.error("Por favor, selecione apenas imagens")
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      notification.error("Arquivo muito grande. Máximo 10MB")
      return
    }

    processDocument(file)
  }

  const processDocument = async (file: File) => {
    setIsAnalyzing(true)
    
    try {
      // Create preview
      const preview = URL.createObjectURL(file)
      
      // Simulate document analysis (in production, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock analysis results
      const analysisResult = {
        isValid: Math.random() > 0.2, // 80% success rate
        confidence: 0.85 + Math.random() * 0.1,
        extractedData: {
          name: "João Silva Santos",
          documentNumber: "123456789",
          issuingDate: "2020-01-15"
        }
      }

      const side = currentUpload || (documents.length === 0 ? "front" : "back")
      
      const newDocument: UploadedDocument = {
        file,
        preview,
        side,
        isValid: analysisResult.isValid,
        confidence: analysisResult.confidence
      }

      setDocuments(prev => {
        const filtered = prev.filter(doc => doc.side !== side)
        return [...filtered, newDocument]
      })

      if (analysisResult.isValid) {
        notification.success(`${side === "front" ? "Frente" : "Verso"} do documento processado com sucesso!`)
      } else {
        notification.error("Documento não foi reconhecido. Tente novamente com melhor qualidade.")
      }

    } catch (error) {
      notification.error("Erro ao processar documento")
    } finally {
      setIsAnalyzing(false)
      setCurrentUpload(null)
    }
  }

  const removeDocument = (side: "front" | "back") => {
    setDocuments(prev => prev.filter(doc => doc.side !== side))
  }

  const triggerUpload = (side: "front" | "back", source: "upload" | "camera") => {
    setCurrentUpload(side)
    if (source === "upload") {
      fileInputRef.current?.click()
    } else {
      cameraInputRef.current?.click()
    }
  }

  const canProceed = () => {
    if (config.needsBothSides) {
      return documents.length === 2 && documents.every(doc => doc.isValid)
    } else {
      return documents.length === 1 && documents[0].isValid
    }
  }

  const handleComplete = () => {
    const frontDoc = documents.find(doc => doc.side === "front")
    const backDoc = documents.find(doc => doc.side === "back")
    
    onComplete({
      documentFront: frontDoc?.file,
      documentBack: backDoc?.file
    })
  }

  const renderUploadArea = (side: "front" | "back", label: string) => {
    const existingDoc = documents.find(doc => doc.side === side)
    
    if (existingDoc) {
      return (
        <Card className="p-4">
          <div className="relative">
            <Image
              src={existingDoc.preview}
              alt={label}
              width={300}
              height={200}
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => removeDocument(side)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="absolute bottom-2 left-2">
              <Badge variant={existingDoc.isValid ? "default" : "destructive"}>
                {existingDoc.isValid ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Válido ({Math.round((existingDoc.confidence || 0) * 100)}%)
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Inválido
                  </>
                )}
              </Badge>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerUpload(side, "upload")}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refazer
            </Button>
          </div>
        </Card>
      )
    }

    return (
      <Card className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 transition-colors">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium mb-2">{label}</h4>
          <p className="text-sm text-gray-500 mb-4">
            Adicione uma foto nítida e bem iluminada
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => triggerUpload(side, "upload")}
              disabled={isAnalyzing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              variant="outline"
              onClick={() => triggerUpload(side, "camera")}
              disabled={isAnalyzing}
            >
              <Camera className="w-4 h-4 mr-2" />
              Câmera
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-6">
          <CreditCard className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{config.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Faça upload de fotos nítidas do seu documento
          </p>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Dicas para melhor resultado:
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {config.tips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>

        {/* Upload Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {renderUploadArea("front", config.frontLabel)}
          {config.needsBothSides && renderUploadArea("back", config.backLabel)}
        </div>

        {/* Analysis Loading */}
        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-purple-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span>Analisando documento...</span>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleComplete}
          disabled={!canProceed() || isAnalyzing}
          className="w-full"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Continuar
        </Button>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, "upload")}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e, "camera")}
        className="hidden"
      />
    </div>
  )
}