import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const simulatePixSchema = z.object({
  pixId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validation = simulatePixSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Dados inválidos: pixId é obrigatório", 
          success: false,
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { pixId } = validation.data

    // Only allow simulation in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Simulação disponível apenas em desenvolvimento", success: false },
        { status: 403 }
      )
    }

    // Simulate PIX payment with AbacatePay
    const response = await fetch(
      `https://api.abacatepay.com/v1/pixQrCode/simulate-payment?id=${pixId}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.ABACATEPAY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            userId: user.id,
            environment: "development",
            simulatedAt: new Date().toISOString(),
          }
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("AbacatePay simulation error:", error)
      return NextResponse.json(
        { 
          error: error.message || "Erro ao simular pagamento PIX", 
          success: false 
        },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: "Pagamento PIX simulado com sucesso!",
      data: result.data,
    })
  } catch (error) {
    console.error("PIX simulation error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Erro ao simular pagamento",
        success: false 
      },
      { status: 500 }
    )
  }
}