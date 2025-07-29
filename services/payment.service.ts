import { apiClient, type ApiResponse } from "./api"
import { createClient } from "@/app/lib/supabase-browser"
import type {
  Subscription,
  PaymentMethod,
  CreateSubscriptionData,
  UpdateSubscriptionData,
  PaymentIntent,
  PlanType,
  BillingHistory,
} from "@/types/payment.types"

/**
 * Payment service handling subscriptions and billing
 */
export class PaymentService {
  private supabase = createClient()
  private stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

  /**
   * Get user's current subscription
   */
  async getSubscription(): Promise<ApiResponse<Subscription | null>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      const { data, error } = await this.supabase
        .from("subscriptions")
        .select(`
          *,
          user:users(*),
          payment_method:payment_methods(*)
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      if (error && error.code !== "PGRST116") {
        // Not found is OK
        return {
          data: null,
          error: "Erro ao carregar assinatura",
          success: false,
          status: 400,
        }
      }

      return {
        data: (data as Subscription) || null,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao carregar assinatura",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Create new subscription
   */
  async createSubscription(subscriptionData: CreateSubscriptionData): Promise<ApiResponse<Subscription>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Check if user already has active subscription
      const existingSubscription = await this.getSubscription()
      if (existingSubscription.data) {
        return {
          data: null,
          error: "Usuário já possui uma assinatura ativa",
          success: false,
          status: 400,
        }
      }

      // Create payment intent via API
      const paymentResponse = await apiClient.post<PaymentIntent>("/payments/create-subscription", {
        plan_type: subscriptionData.planType,
        payment_method_id: subscriptionData.paymentMethodId,
        billing_cycle: subscriptionData.billingCycle,
      })

      if (!paymentResponse.success || !paymentResponse.data) {
        return {
          data: null,
          error: paymentResponse.error || "Erro ao processar pagamento",
          success: false,
          status: 400,
        }
      }

      // If payment requires confirmation, return payment intent
      if (paymentResponse.data.status === "requires_confirmation") {
        return {
          data: null,
          error: "Pagamento requer confirmação",
          success: false,
          status: 402, // Payment required
        }
      }

      // Create subscription record
      const subscriptionRecord = {
        user_id: user.id,
        plan_type: subscriptionData.planType,
        status: "active" as const,
        billing_cycle: subscriptionData.billingCycle,
        amount: this.getPlanPrice(subscriptionData.planType, subscriptionData.billingCycle),
        currency: "BRL",
        stripe_subscription_id: paymentResponse.data.subscription_id,
        current_period_start: new Date().toISOString(),
        current_period_end: this.calculatePeriodEnd(subscriptionData.billingCycle),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: subscription, error } = await this.supabase
        .from("subscriptions")
        .insert([subscriptionRecord])
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: "Erro ao criar assinatura",
          success: false,
          status: 400,
        }
      }

      // Update user premium type
      await this.supabase
        .from("users")
        .update({
          premium_type: subscriptionData.planType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      return {
        data: subscription as Subscription,
        error: null,
        success: true,
        status: 201,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao criar assinatura",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionData: UpdateSubscriptionData): Promise<ApiResponse<Subscription>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Get current subscription
      const currentSubscription = await this.getSubscription()
      if (!currentSubscription.data) {
        return {
          data: null,
          error: "Nenhuma assinatura ativa encontrada",
          success: false,
          status: 404,
        }
      }

      // Update subscription via Stripe API
      const updateResponse = await apiClient.put<Subscription>("/payments/update-subscription", {
        subscription_id: currentSubscription.data.stripe_subscription_id,
        plan_type: subscriptionData.planType,
        billing_cycle: subscriptionData.billingCycle,
      })

      if (!updateResponse.success) {
        return {
          data: null,
          error: updateResponse.error || "Erro ao atualizar assinatura",
          success: false,
          status: 400,
        }
      }

      // Update local subscription record
      const { data: updatedSubscription, error } = await this.supabase
        .from("subscriptions")
        .update({
          plan_type: subscriptionData.planType,
          billing_cycle: subscriptionData.billingCycle,
          amount: this.getPlanPrice(subscriptionData.planType, subscriptionData.billingCycle),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("status", "active")
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: "Erro ao atualizar registro da assinatura",
          success: false,
          status: 400,
        }
      }

      // Update user premium type
      await this.supabase
        .from("users")
        .update({
          premium_type: subscriptionData.planType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      return {
        data: updatedSubscription as Subscription,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao atualizar assinatura",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<ApiResponse<null>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Get current subscription
      const currentSubscription = await this.getSubscription()
      if (!currentSubscription.data) {
        return {
          data: null,
          error: "Nenhuma assinatura ativa encontrada",
          success: false,
          status: 404,
        }
      }

      // Cancel subscription via Stripe API
      const cancelResponse = await apiClient.post("/payments/cancel-subscription", {
        subscription_id: currentSubscription.data.stripe_subscription_id,
      })

      if (!cancelResponse.success) {
        return {
          data: null,
          error: cancelResponse.error || "Erro ao cancelar assinatura",
          success: false,
          status: 400,
        }
      }

      // Update subscription status
      const { error } = await this.supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("status", "active")

      if (error) {
        return {
          data: null,
          error: "Erro ao atualizar status da assinatura",
          success: false,
          status: 400,
        }
      }

      // Update user premium type to free
      await this.supabase
        .from("users")
        .update({
          premium_type: "free",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      return {
        data: null,
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao cancelar assinatura",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get billing history
   */
  async getBillingHistory(): Promise<ApiResponse<BillingHistory[]>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      const { data, error } = await this.supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        return {
          data: null,
          error: "Erro ao carregar histórico de cobrança",
          success: false,
          status: 400,
        }
      }

      return {
        data: data as BillingHistory[],
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao carregar histórico",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(paymentMethodData: { token: string; type: "card" | "pix" }): Promise<
    ApiResponse<PaymentMethod>
  > {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      // Add payment method via API
      const response = await apiClient.post<PaymentMethod>("/payments/add-payment-method", {
        token: paymentMethodData.token,
        type: paymentMethodData.type,
      })

      if (!response.success || !response.data) {
        return {
          data: null,
          error: response.error || "Erro ao adicionar método de pagamento",
          success: false,
          status: 400,
        }
      }

      // Save payment method locally
      const { data: paymentMethod, error } = await this.supabase
        .from("payment_methods")
        .insert([
          {
            user_id: user.id,
            stripe_payment_method_id: response.data.id,
            type: paymentMethodData.type,
            last_four: response.data.last_four,
            brand: response.data.brand,
            is_default: response.data.is_default,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: "Erro ao salvar método de pagamento",
          success: false,
          status: 400,
        }
      }

      return {
        data: paymentMethod as PaymentMethod,
        error: null,
        success: true,
        status: 201,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao adicionar método de pagamento",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: "Usuário não autenticado",
          success: false,
          status: 401,
        }
      }

      const { data, error } = await this.supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        return {
          data: null,
          error: "Erro ao carregar métodos de pagamento",
          success: false,
          status: 400,
        }
      }

      return {
        data: data as PaymentMethod[],
        error: null,
        success: true,
        status: 200,
      }
    } catch (error) {
      return {
        data: null,
        error: "Erro inesperado ao carregar métodos de pagamento",
        success: false,
        status: 500,
      }
    }
  }

  /**
   * Get plan pricing
   */
  private getPlanPrice(planType: PlanType, billingCycle: "monthly" | "yearly"): number {
    const prices = {
      gold: { monthly: 19.9, yearly: 199.9 },
      diamond: { monthly: 39.9, yearly: 399.9 },
      couple: { monthly: 59.9, yearly: 599.9 },
    }

    return prices[planType]?.[billingCycle] || 0
  }

  /**
   * Calculate period end date
   */
  private calculatePeriodEnd(billingCycle: "monthly" | "yearly"): string {
    const now = new Date()
    if (billingCycle === "monthly") {
      now.setMonth(now.getMonth() + 1)
    } else {
      now.setFullYear(now.getFullYear() + 1)
    }
    return now.toISOString()
  }
}

// Export singleton instance
export const paymentService = new PaymentService()
