"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, ImageIcon, Video, Music, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface MediaUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  allowVideo?: boolean
  allowAudio?: boolean
  className?: string
}

export function MediaUploader({
  files,
  onChange,
  maxFiles = 5,
  maxSize = 10,
  allowVideo = false,
  allowAudio = false,
  className,
}: MediaUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setErrors([])

      // Handle rejected files
      const newErrors: string[] = []
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === "file-too-large") {
            newErrors.push(`${file.name} é muito grande (máximo ${maxSize}MB)`)
          } else if (error.code === "file-invalid-type") {
            newErrors.push(`${file.name} não é um tipo de arquivo suportado`)
          }
        })
      })

      // Check total files limit
      if (files.length + acceptedFiles.length > maxFiles) {
        newErrors.push(`Máximo de ${maxFiles} arquivos permitidos`)
        setErrors(newErrors)
        return
      }

      if (newErrors.length > 0) {
        setErrors(newErrors)
        return
      }

      // Add accepted files
      const newFiles = [...files, ...acceptedFiles]
      console.log("[MEDIA UPLOADER] Adding files:", { 
        current: files.length, 
        adding: acceptedFiles.length, 
        total: newFiles.length,
        fileNames: acceptedFiles.map(f => f.name)
      })
      onChange(newFiles)

      // Simulate upload progress
      acceptedFiles.forEach((file) => {
        const fileId = `${file.name}-${file.size}`
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 30
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
          }
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
        }, 200)
      })
    },
    [files, onChange, maxFiles, maxSize],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      ...(allowVideo && {
        "video/*": [".mp4", ".mov", ".avi", ".webm", ".m4v", ".3gp"],
        "video/mp4": [".mp4", ".m4v"],
        "video/quicktime": [".mov"],
        "video/x-msvideo": [".avi"],
        "video/webm": [".webm"],
        "video/3gpp": [".3gp"]
      }),
      ...(allowAudio && {
        "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".webm"],
      }),
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: true,
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    console.log("[MEDIA UPLOADER] Removing file at index:", index, "New count:", newFiles.length)
    onChange(newFiles)
  }

  const getFilePreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file)
    }
    return null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-purple-400 hover:bg-gray-50",
          )}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <div className="text-sm text-gray-600">
              {isDragActive ? (
                <p>Solte os arquivos aqui...</p>
              ) : (
                <div>
                  <p>
                    Arraste arquivos aqui ou <span className="text-purple-600 font-medium">clique para selecionar</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {allowVideo && allowAudio 
                      ? "Imagens, vídeos e áudios" 
                      : allowVideo 
                        ? "Imagens e vídeos" 
                        : allowAudio 
                          ? "Imagens e áudios"
                          : "Apenas imagens"} até {maxSize}MB cada
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {files.map((file, index) => {
              const fileId = `${file.name}-${file.size}`
              const progress = uploadProgress[fileId] || 0
              const preview = getFilePreview(file)
              const isVideo = file.type.startsWith("video/")
              const isAudio = file.type.startsWith("audio/")

              return (
                <motion.div
                  key={fileId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                    {preview && !isVideo && !isAudio ? (
                      <Image src={preview || "/placeholder.svg"} alt={file.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {isVideo ? (
                          <Video className="h-8 w-8 text-gray-400" />
                        ) : isAudio ? (
                          <Music className="h-8 w-8 text-gray-400" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    )}

                    {/* Upload Progress */}
                    {progress < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-16 h-16 relative">
                          <Progress value={progress} className="w-full" />
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* File Info */}
                  <div className="mt-2 text-xs text-gray-600 truncate">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
