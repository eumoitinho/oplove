-- =====================================================
-- Payment System Atomic Functions
-- RPC functions for atomic payment operations
-- =====================================================

-- Function to activate subscription atomically
CREATE OR REPLACE FUNCTION activate_user_subscription(
    p_subscription_id UUID,
    p_user_id UUID,
    p_payment_id VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription RECORD;
    v_result JSONB;
BEGIN
    -- Start transaction is implicit in function
    
    -- Get subscription details
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE id = p_subscription_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Subscription not found'
        );
    END IF;
    
    -- Update subscription status
    UPDATE subscriptions
    SET 
        status = 'active',
        activated_at = NOW(),
        updated_at = NOW()
    WHERE id = p_subscription_id;
    
    -- Update user premium status
    UPDATE users
    SET 
        premium_type = v_subscription.plan_type,
        premium_expires_at = v_subscription.current_period_end,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Update payment history if payment_id provided
    IF p_payment_id IS NOT NULL THEN
        UPDATE payment_history
        SET 
            status = 'completed',
            paid_at = NOW(),
            updated_at = NOW()
        WHERE provider_payment_id = p_payment_id;
    END IF;
    
    -- Log the activation
    INSERT INTO webhook_events (provider, event_type, event_data, processed)
    VALUES (
        'system',
        'subscription.activated',
        jsonb_build_object(
            'subscription_id', p_subscription_id,
            'user_id', p_user_id,
            'plan_type', v_subscription.plan_type,
            'payment_id', p_payment_id
        ),
        true
    );
    
    v_result := jsonb_build_object(
        'success', true,
        'subscription_id', p_subscription_id,
        'user_id', p_user_id,
        'plan_type', v_subscription.plan_type
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback is automatic on exception
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to cancel subscription atomically
CREATE OR REPLACE FUNCTION cancel_user_subscription(
    p_subscription_id UUID,
    p_user_id UUID,
    p_cancel_at_period_end BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription RECORD;
    v_result JSONB;
BEGIN
    -- Get subscription details
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE id = p_subscription_id AND user_id = p_user_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Active subscription not found'
        );
    END IF;
    
    IF p_cancel_at_period_end THEN
        -- Schedule cancellation at period end
        UPDATE subscriptions
        SET 
            cancel_at_period_end = true,
            updated_at = NOW()
        WHERE id = p_subscription_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'message', 'Subscription will be cancelled at period end',
            'subscription_id', p_subscription_id,
            'cancel_at', v_subscription.current_period_end
        );
    ELSE
        -- Cancel immediately
        UPDATE subscriptions
        SET 
            status = 'cancelled',
            canceled_at = NOW(),
            updated_at = NOW()
        WHERE id = p_subscription_id;
        
        -- Downgrade user to free
        UPDATE users
        SET 
            premium_type = 'free',
            premium_expires_at = NULL,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'message', 'Subscription cancelled immediately',
            'subscription_id', p_subscription_id
        );
    END IF;
    
    -- Log the cancellation
    INSERT INTO webhook_events (provider, event_type, event_data, processed)
    VALUES (
        'system',
        'subscription.cancelled',
        jsonb_build_object(
            'subscription_id', p_subscription_id,
            'user_id', p_user_id,
            'plan_type', v_subscription.plan_type,
            'cancel_at_period_end', p_cancel_at_period_end
        ),
        true
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to upgrade/downgrade subscription atomically
CREATE OR REPLACE FUNCTION change_user_subscription(
    p_subscription_id UUID,
    p_user_id UUID,
    p_new_plan_type premium_type,
    p_new_billing_period billing_period DEFAULT NULL,
    p_prorate_amount DECIMAL DEFAULT 0.00
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription RECORD;
    v_plan_prices JSONB;
    v_new_amount DECIMAL;
    v_result JSONB;
BEGIN
    -- Get subscription details
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE id = p_subscription_id AND user_id = p_user_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Active subscription not found'
        );
    END IF;
    
    -- Plan pricing (could be moved to a configuration table)
    v_plan_prices := '{
        "gold": {"monthly": 25.00, "quarterly": 67.50, "semiannual": 127.50, "annual": 240.00},
        "diamond": {"monthly": 45.00, "quarterly": 121.50, "semiannual": 229.50, "annual": 432.00},
        "couple": {"monthly": 69.90, "quarterly": 188.73, "semiannual": 356.49, "annual": 671.04}
    }'::jsonb;
    
    -- Calculate new amount
    v_new_amount := (v_plan_prices->p_new_plan_type->(COALESCE(p_new_billing_period::text, v_subscription.billing_period::text)))::decimal;
    
    -- Update subscription
    UPDATE subscriptions
    SET 
        plan_type = p_new_plan_type,
        billing_period = COALESCE(p_new_billing_period, billing_period),
        amount = v_new_amount,
        updated_at = NOW()
    WHERE id = p_subscription_id;
    
    -- Update user premium status
    UPDATE users
    SET 
        premium_type = p_new_plan_type,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Create payment history record for proration if applicable
    IF p_prorate_amount != 0 THEN
        INSERT INTO payment_history (
            user_id,
            subscription_id,
            amount,
            currency,
            payment_method,
            provider,
            status,
            description,
            created_at
        ) VALUES (
            p_user_id,
            p_subscription_id,
            p_prorate_amount,
            'BRL',
            v_subscription.payment_method,
            v_subscription.provider,
            CASE WHEN p_prorate_amount > 0 THEN 'pending' ELSE 'completed' END,
            'Proration for plan change from ' || v_subscription.plan_type || ' to ' || p_new_plan_type,
            NOW()
        );
    END IF;
    
    -- Log the change
    INSERT INTO webhook_events (provider, event_type, event_data, processed)
    VALUES (
        'system',
        'subscription.plan_changed',
        jsonb_build_object(
            'subscription_id', p_subscription_id,
            'user_id', p_user_id,
            'old_plan_type', v_subscription.plan_type,
            'new_plan_type', p_new_plan_type,
            'old_amount', v_subscription.amount,
            'new_amount', v_new_amount,
            'prorate_amount', p_prorate_amount
        ),
        true
    );
    
    v_result := jsonb_build_object(
        'success', true,
        'subscription_id', p_subscription_id,
        'old_plan', v_subscription.plan_type,
        'new_plan', p_new_plan_type,
        'new_amount', v_new_amount,
        'prorate_amount', p_prorate_amount
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to process credit purchase atomically
CREATE OR REPLACE FUNCTION process_credit_purchase(
    p_business_id UUID,
    p_transaction_id UUID,
    p_new_balance INTEGER,
    p_payment_id VARCHAR,
    p_paid_at TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Update business credit balance
    UPDATE businesses
    SET 
        credit_balance = p_new_balance,
        total_credits_purchased = total_credits_purchased + (
            SELECT credits FROM credit_transactions WHERE id = p_transaction_id
        ),
        updated_at = NOW()
    WHERE id = p_business_id;
    
    -- Update transaction status
    UPDATE credit_transactions
    SET 
        payment_status = 'paid',
        balance_after = p_new_balance,
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{paid_at}',
            to_jsonb(p_paid_at)
        ),
        updated_at = NOW()
    WHERE id = p_transaction_id;
    
    v_result := jsonb_build_object(
        'success', true,
        'business_id', p_business_id,
        'transaction_id', p_transaction_id,
        'new_balance', p_new_balance
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to calculate subscription prorating
CREATE OR REPLACE FUNCTION calculate_subscription_proration(
    p_current_plan premium_type,
    p_new_plan premium_type,
    p_billing_period billing_period,
    p_current_period_start TIMESTAMP WITH TIME ZONE,
    p_current_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan_prices JSONB;
    v_current_plan_price DECIMAL;
    v_new_plan_price DECIMAL;
    v_days_total INTEGER;
    v_days_remaining INTEGER;
    v_current_daily_cost DECIMAL;
    v_new_daily_cost DECIMAL;
    v_proration_amount DECIMAL;
    v_result JSONB;
BEGIN
    -- Plan pricing
    v_plan_prices := '{
        "gold": {"monthly": 25.00, "quarterly": 67.50, "semiannual": 127.50, "annual": 240.00},
        "diamond": {"monthly": 45.00, "quarterly": 121.50, "semiannual": 229.50, "annual": 432.00},
        "couple": {"monthly": 69.90, "quarterly": 188.73, "semiannual": 356.49, "annual": 671.04}
    }'::jsonb;
    
    -- Get plan prices
    v_current_plan_price := (v_plan_prices->p_current_plan->p_billing_period::text)::decimal;
    v_new_plan_price := (v_plan_prices->p_new_plan->p_billing_period::text)::decimal;
    
    -- Calculate days
    v_days_total := EXTRACT(EPOCH FROM (p_current_period_end - p_current_period_start))::integer / 86400;
    v_days_remaining := GREATEST(0, EXTRACT(EPOCH FROM (p_current_period_end - NOW()))::integer / 86400);
    
    -- Calculate daily costs
    v_current_daily_cost := v_current_plan_price / v_days_total;
    v_new_daily_cost := v_new_plan_price / v_days_total;
    
    -- Calculate proration (positive = charge user, negative = credit user)
    v_proration_amount := (v_new_daily_cost - v_current_daily_cost) * v_days_remaining;
    
    v_result := jsonb_build_object(
        'current_plan_price', v_current_plan_price,
        'new_plan_price', v_new_plan_price,
        'days_total', v_days_total,
        'days_remaining', v_days_remaining,
        'current_daily_cost', v_current_daily_cost,
        'new_daily_cost', v_new_daily_cost,
        'proration_amount', v_proration_amount,
        'proration_description', 
            CASE 
                WHEN v_proration_amount > 0 THEN 'Additional charge required'
                WHEN v_proration_amount < 0 THEN 'Credit will be applied'
                ELSE 'No proration needed'
            END
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to retry failed payments
CREATE OR REPLACE FUNCTION retry_failed_payment(
    p_payment_history_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payment RECORD;
    v_subscription RECORD;
    v_result JSONB;
BEGIN
    -- Get payment details
    SELECT * INTO v_payment
    FROM payment_history
    WHERE id = p_payment_history_id AND status = 'failed';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed payment not found'
        );
    END IF;
    
    -- Get subscription details
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE id = v_payment.subscription_id;
    
    -- Update payment status to pending for retry
    UPDATE payment_history
    SET 
        status = 'pending',
        error_message = NULL,
        retry_count = COALESCE(retry_count, 0) + 1,
        updated_at = NOW()
    WHERE id = p_payment_history_id;
    
    -- Log retry attempt
    INSERT INTO webhook_events (provider, event_type, event_data, processed)
    VALUES (
        'system',
        'payment.retry_attempted',
        jsonb_build_object(
            'payment_id', p_payment_history_id,
            'user_id', v_payment.user_id,
            'subscription_id', v_payment.subscription_id,
            'amount', v_payment.amount,
            'retry_count', COALESCE(v_payment.retry_count, 0) + 1
        ),
        true
    );
    
    v_result := jsonb_build_object(
        'success', true,
        'payment_id', p_payment_history_id,
        'retry_count', COALESCE(v_payment.retry_count, 0) + 1,
        'message', 'Payment marked for retry'
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION activate_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION change_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION process_credit_purchase TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_subscription_proration TO authenticated;
GRANT EXECUTE ON FUNCTION retry_failed_payment TO authenticated;

-- Add comments
COMMENT ON FUNCTION activate_user_subscription IS 'Atomically activate a user subscription and update all related records';
COMMENT ON FUNCTION cancel_user_subscription IS 'Atomically cancel a user subscription with option to cancel at period end';
COMMENT ON FUNCTION change_user_subscription IS 'Atomically change subscription plan with proration calculation';
COMMENT ON FUNCTION process_credit_purchase IS 'Atomically process credit purchase for business accounts';
COMMENT ON FUNCTION calculate_subscription_proration IS 'Calculate proration amount for subscription plan changes';
COMMENT ON FUNCTION retry_failed_payment IS 'Mark failed payment for retry and log attempt';