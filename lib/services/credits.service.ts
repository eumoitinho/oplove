import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'

export class CreditsService {
  // Initialize user credits if not exists
  static async initializeUserCredits(userId: string, isServer = true) {
    const supabase = isServer ? await createServerClient() : createClient()
    
    try {
      // Check if user already has credits record
      const { data: existingCredits, error: checkError } = await supabase
        .from('user_credits')
        .select('id')
        .eq('user_id', userId)
        .single()

      // If no record exists, create one
      if (!existingCredits && checkError?.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            credit_balance: 0,
            total_purchased: 0,
            total_spent: 0,
            total_gifted: 0,
            total_received: 0
          })

        if (insertError) {
          console.error('Error initializing user credits:', insertError)
          throw insertError
        }

        console.log(`Initialized credits for user ${userId}`)
      }

      return true
    } catch (error) {
      console.error('Error in initializeUserCredits:', error)
      return false
    }
  }

  // Get user credit balance
  static async getUserCredits(userId: string, isServer = true) {
    const supabase = isServer ? await createServerClient() : createClient()
    
    try {
      // Try to get existing credits
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // No record found, initialize it
        await this.initializeUserCredits(userId, isServer)
        
        // Try again
        const { data: newData, error: newError } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (newError) throw newError
        return newData
      }

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting user credits:', error)
      return null
    }
  }

  // Add credits transaction
  static async addTransaction(
    userId: string,
    type: 'purchase' | 'spend' | 'gift_sent' | 'gift_received' | 'refund' | 'bonus',
    amount: number,
    description: string,
    referenceType?: string,
    referenceId?: string,
    otherUserId?: string,
    isServer = true
  ) {
    const supabase = isServer ? await createServerClient() : createClient()
    
    try {
      // Ensure user has credits record
      await this.initializeUserCredits(userId, isServer)

      // Insert transaction
      const { data, error } = await supabase
        .from('user_credit_transactions')
        .insert({
          user_id: userId,
          type,
          amount,
          description,
          reference_type: referenceType,
          reference_id: referenceId,
          other_user_id: otherUserId,
          balance_before: 0, // Will be set by trigger
          balance_after: 0   // Will be set by trigger
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding credit transaction:', error)
      return null
    }
  }
}