"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Copy, CheckCircle2, Clock, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import Image from "next/image"

function PixPaymentContent() {
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  
  const pixCode = searchParams.get("code") || ""
  const qrCodeUrl = searchParams.get("qr") || ""
  const paymentId = searchParams.get("id") || ""
  const expiresAt = searchParams.get("expires") || ""

  // Countdown timer
  useEffect(() => {
    if (expiresAt) {
      const expirationTime = new Date(expiresAt).getTime()
      const now = Date.now()
      const initialTimeLeft = Math.max(0, Math.floor((expirationTime - now) / 1000))
      setTimeLeft(initialTimeLeft)
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          showToast("PIX expirado. Gerando novo código...", "warning")
          router.push("/plans")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, router, showToast])

  // Check payment status periodically
  useEffect(() => {
    const checkPayment = async () => {
      setChecking(true)
      try {
        const response = await fetch("/api/v1/payments/subscription")
        const data = await response.json()
        
        if (data.data?.status === "active") {
          showToast("Pagamento confirmado! Redirecionando...", "success")
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        }
      } catch (error) {
        console.error("Error checking payment:", error)
      } finally {
        setChecking(false)
      }
    }

    // Check every 5 seconds
    const interval = setInterval(checkPayment, 5000)
    checkPayment() // Check immediately

    return () => clearInterval(interval)
  }, [router, showToast])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      showToast("Código PIX copiado!", "success")
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      showToast("Erro ao copiar código", "error")
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />

      <main className="relative z-10 container max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Pagamento PIX</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Escaneie o QR Code ou copie o código para fazer o pagamento
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                QR Code PIX
              </h2>
              
              <div className="bg-white p-4 rounded-xl mb-4">
                {qrCodeUrl ? (
                  <Image
                    src={decodeURIComponent(qrCodeUrl)}
                    alt="QR Code PIX"
                    width={250}
                    height={250}
                    className="mx-auto"
                  />
                ) : (
                  <div className="w-[250px] h-[250px] bg-gray-200 animate-pulse rounded" />
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Abra o app do seu banco e escaneie o código
              </p>
            </Card>
          </motion.div>

          {/* PIX Code */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <h2 className="text-lg font-semibold mb-4">Código PIX</h2>
              
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                  Copie e cole no seu app bancário:
                </p>
                <div className="font-mono text-sm break-all select-all">
                  {pixCode}
                </div>
              </div>

              <Button
                onClick={copyToClipboard}
                className="w-full mb-4"
                variant={copied ? "default" : "outline"}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código PIX
                  </>
                )}
              </Button>

              {/* Timer */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                <div className="flex items-center text-orange-600 dark:text-orange-400">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Tempo restante:</span>
                  <span className="ml-auto text-lg font-mono">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Payment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
            <div className="text-center">
              {checking ? (
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-purple-600 rounded-full mx-auto mb-4 animate-bounce" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Aguardando confirmação do pagamento...
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Faça o pagamento para ativar sua assinatura
                  </p>
                </>
              )}
              
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                A confirmação é automática e pode levar alguns segundos
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
            <h3 className="font-semibold mb-3">Como pagar com PIX:</h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                Abra o aplicativo do seu banco
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                Procure a opção PIX ou Pagar com QR Code
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                Escaneie o QR Code ou cole o código copiado
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                Confirme o pagamento
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">5.</span>
                Aguarde a confirmação automática nesta página
              </li>
            </ol>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/plans")}
            className="flex-1"
          >
            Escolher outro plano
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/checkout?plan=diamond&period=monthly")}
            className="flex-1"
          >
            Pagar com cartão
          </Button>
        </motion.div>
      </main>
    </div>
  )
}

export default function PixPaymentPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PixPaymentContent />
    </Suspense>
  )
}