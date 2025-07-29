/**
 * Payment-related TypeScript types for OpenLove
 */

import type { User, PremiumType } from "./user.types"

export interface Subscription {
  id: string
  user_id: string
  plan_type: PremiumType
  status: "active" | "canceled" | "past_due" | "unpaid" | "incomplete"
  billing_cycle: "monthly" | "yearly"
  amount: number
  currency: string
  stripe_subscription_id: string
  stripe_customer_id: string
  current_period_start: string
  current_period_end: string
  trial_start: string | null
  trial_end: string | null
  canceled_at: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string

  // Relations
  user: User
  payment_method: PaymentMethod | null
  invoices: Invoice[]
}

export interface PaymentMethod {
  id: string
  user_id: string
  stripe_payment_method_id: string
  type: "card" | "pix" | "boleto"
  brand: string | null // visa, mastercard, etc.
  last_four: string | null
  exp_month: number | null
  exp_year: number | null
  is_default: boolean
  billing_address: BillingAddress | null
  created_at: string
  updated_at: string

  // Relations
  user: User
}

export interface BillingAddress {
  name: string
  email: string
  phone: string | null
  line1: string
  line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  tax_id: string | null // CPF/CNPJ
}

export interface Invoice {
  id: string
  user_id: string
  subscription_id: string | null
  stripe_invoice_id: string
  amount_paid: number
  amount_due: number
  currency: string
  status: "draft" | "open" | "paid" | "uncollectible" | "void"
  description: string
  invoice_pdf: string | null
  hosted_invoice_url: string | null
  payment_intent_id: string | null
  period_start: string
  period_end: string
  due_date: string | null
  paid_at: string | null
  created_at: string
  updated_at: string

  // Relations
  user: User
  subscription: Subscription | null
  line_items: InvoiceLineItem[]
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  amount: number
  quantity: number
  unit_amount: number
  currency: string
  period_start: string | null
  period_end: string | null

  // Relations
  invoice: Invoice
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "succeeded"
    | "canceled"
  client_secret: string
  subscription_id?: string
  metadata: Record<string, string>
  created_at: string
}

export interface CreateSubscriptionData {
  planType: Exclude<PremiumType, "free">
  billingCycle: "monthly" | "yearly"
  paymentMethodId: string
  couponCode?: string
  billingAddress?: BillingAddress
}

export interface UpdateSubscriptionData {
  planType?: Exclude<PremiumType, "free">
  billingCycle?: "monthly" | "yearly"
  paymentMethodId?: string
}

export interface BillingHistory {
  id: string
  user_id: string
  type: "subscription" | "one_time" | "refund" | "chargeback"
  description: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  payment_method: string
  transaction_id: string
  invoice_url: string | null
  created_at: string

  // Relations
  user: User
}

export interface PlanFeatures {
  name: string
  price_monthly: number
  price_yearly: number
  features: {
    messages_per_day: number | null // null = unlimited
    max_images_per_post: number
    max_video_length: number // seconds
    max_file_size: number // MB
    can_upload_videos: boolean
    can_record_audio: boolean
    can_create_polls: boolean
    can_create_stories: boolean
    can_make_voice_calls: boolean
    can_make_video_calls: boolean
    can_create_groups: boolean
    can_see_who_viewed_profile: boolean
    show_ads: boolean
    ad_frequency: number // posts between ads
    can_verify_identity: boolean
    priority_support: boolean
    analytics_access: boolean
    custom_themes: boolean
    advanced_search: boolean
    can_promote_posts: boolean
    can_create_events: boolean
    can_sell_content: boolean
  }
}

export interface Coupon {
  id: string
  code: string
  type: "percentage" | "fixed_amount"
  value: number
  currency: string | null
  duration: "once" | "repeating" | "forever"
  duration_in_months: number | null
  max_redemptions: number | null
  times_redeemed: number
  valid_from: string
  valid_until: string | null
  applicable_plans: PremiumType[]
  first_time_only: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CouponUsage {
  id: string
  coupon_id: string
  user_id: string
  subscription_id: string
  discount_amount: number
  currency: string
  used_at: string

  // Relations
  coupon: Coupon
  user: User
  subscription: Subscription
}

// Pix payment types (Brazilian payment method)
export interface PixPayment {
  id: string
  user_id: string
  amount: number
  currency: string
  description: string
  pix_key: string
  qr_code: string
  qr_code_image: string
  expires_at: string
  status: "pending" | "paid" | "expired" | "canceled"
  paid_at: string | null
  transaction_id: string | null
  created_at: string
  updated_at: string

  // Relations
  user: User
}

// Boleto payment types (Brazilian payment method)
export interface BoletoPayment {
  id: string
  user_id: string
  amount: number
  currency: string
  description: string
  barcode: string
  boleto_url: string
  due_date: string
  status: "pending" | "paid" | "expired" | "canceled"
  paid_at: string | null
  bank_slip_url: string | null
  created_at: string
  updated_at: string

  // Relations
  user: User
}

// Refund types
export interface Refund {
  id: string
  payment_id: string
  user_id: string
  amount: number
  currency: string
  reason: "requested_by_customer" | "duplicate" | "fraudulent" | "subscription_canceled"
  status: "pending" | "succeeded" | "failed" | "canceled"
  stripe_refund_id: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string

  // Relations
  user: User
}

// Payment analytics
export interface PaymentAnalytics {
  period: string
  total_revenue: number
  total_subscriptions: number
  new_subscriptions: number
  canceled_subscriptions: number
  churn_rate: number
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  ltv: number // Customer Lifetime Value
  plan_distribution: {
    plan_type: PremiumType
    count: number
    revenue: number
    percentage: number
  }[]
  payment_method_distribution: {
    type: string
    count: number
    percentage: number
  }[]
  geographic_distribution: {
    country: string
    state: string
    count: number
    revenue: number
  }[]
  time_series: {
    date: string
    revenue: number
    new_subscriptions: number
    canceled_subscriptions: number
    active_subscriptions: number
  }[]
}

// Webhook types for payment processing
export interface PaymentWebhook {
  id: string
  type: string
  data: Record<string, any>
  processed: boolean
  processed_at: string | null
  error_message: string | null
  retry_count: number
  created_at: string
}

// Tax information
export interface TaxRate {
  id: string
  country: string
  state: string | null
  tax_type: "vat" | "gst" | "sales_tax"
  rate: number
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TaxCalculation {
  subtotal: number
  tax_amount: number
  total: number
  tax_rate: number
  tax_description: string
  currency: string
}
