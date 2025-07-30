/**
 * AbacatePay service for PIX payments integration
 * Documentation: https://docs.abacatepay.com/
 */

interface AbacatePayConfig {
  apiKey: string
  baseUrl: string
  webhookUrl: string
}

interface CreatePixPaymentRequest {
  amount: number // Amount in reais (e.g., 25.00)
  description: string
  externalId: string // Your internal ID
  customerName?: string
  customerEmail?: string
  customerDocument?: string
  expiresIn?: number // Minutes (default: 30)
}

interface CreatePixPaymentResponse {
  id: string
  status: "pending" | "paid" | "expired" | "canceled"
  amount: number
  description: string
  externalId: string
  pixKey: string
  pixCode: string
  qrCode: string
  qrCodeImage: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

interface PixWebhookPayload {
  id: string
  status: "paid" | "expired" | "canceled"
  amount: number
  description: string
  externalId: string
  paidAt?: string
  expiredAt?: string
  canceledAt?: string
}

class AbacatePayService {
  private config: AbacatePayConfig

  constructor(config: AbacatePayConfig) {
    this.config = config
  }

  /**
   * Create a new PIX payment
   */
  async createPixPayment(data: CreatePixPaymentRequest): Promise<CreatePixPaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payments/pix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100), // Convert to cents
          description: data.description,
          external_id: data.externalId,
          customer: {
            name: data.customerName,
            email: data.customerEmail,
            document: data.customerDocument,
          },
          expires_in: data.expiresIn || 30,
          webhook_url: this.config.webhookUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create PIX payment")
      }

      const result = await response.json()

      return {
        id: result.id,
        status: result.status,
        amount: result.amount / 100, // Convert back to reais
        description: result.description,
        externalId: result.external_id,
        pixKey: result.pix_key,
        pixCode: result.pix_code,
        qrCode: result.qr_code,
        qrCodeImage: result.qr_code_image,
        expiresAt: result.expires_at,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }
    } catch (error) {
      console.error("AbacatePay createPixPayment error:", error)
      throw error
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<CreatePixPaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payments/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to get payment status")
      }

      const result = await response.json()

      return {
        id: result.id,
        status: result.status,
        amount: result.amount / 100,
        description: result.description,
        externalId: result.external_id,
        pixKey: result.pix_key,
        pixCode: result.pix_code,
        qrCode: result.qr_code,
        qrCodeImage: result.qr_code_image,
        expiresAt: result.expires_at,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }
    } catch (error) {
      console.error("AbacatePay getPaymentStatus error:", error)
      throw error
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payments/${paymentId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to cancel payment")
      }
    } catch (error) {
      console.error("AbacatePay cancelPayment error:", error)
      throw error
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // AbacatePay uses HMAC-SHA256 for webhook signatures
      const crypto = require("crypto")
      const expectedSignature = crypto
        .createHmac("sha256", this.config.apiKey)
        .update(payload)
        .digest("hex")

      return signature === expectedSignature
    } catch (error) {
      console.error("AbacatePay webhook signature verification error:", error)
      return false
    }
  }

  /**
   * Process webhook payload
   */
  processWebhook(payload: PixWebhookPayload): {
    type: string
    data: PixWebhookPayload
  } {
    let eventType = ""

    switch (payload.status) {
      case "paid":
        eventType = "payment.succeeded"
        break
      case "expired":
        eventType = "payment.expired"
        break
      case "canceled":
        eventType = "payment.canceled"
        break
      default:
        eventType = "payment.status_changed"
    }

    return {
      type: eventType,
      data: payload,
    }
  }
}

// Singleton instance
let abacatePayService: AbacatePayService | null = null

export const getAbacatePayService = (): AbacatePayService => {
  if (!abacatePayService) {
    const config: AbacatePayConfig = {
      apiKey: process.env.ABACATEPAY_API_KEY!,
      baseUrl: process.env.ABACATEPAY_BASE_URL || "https://api.abacatepay.com/v1",
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/payments/webhook/abacatepay`,
    }

    if (!config.apiKey) {
      throw new Error("ABACATEPAY_API_KEY environment variable is required")
    }

    abacatePayService = new AbacatePayService(config)
  }

  return abacatePayService
}

export type {
  CreatePixPaymentRequest,
  CreatePixPaymentResponse,
  PixWebhookPayload,
}

export { AbacatePayService }

// Export singleton instance for backward compatibility
export { getAbacatePayService as abacatepayService }