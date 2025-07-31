-- =====================================================
-- Payment System Critical Fixes
-- Missing tables and schema corrections
-- =====================================================

-- Create webhook_events table for logging all webhook events
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('stripe', 'abacatepay')),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Create coupons table for discount codes
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    description TEXT,
    
    -- Discount configuration
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed_amount')) DEFAULT 'percentage',
    discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount DECIMAL(10,2) CHECK (discount_amount >= 0),
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Usage limits
    max_redemptions INTEGER,
    times_redeemed INTEGER DEFAULT 0,
    first_time_only BOOLEAN DEFAULT false,
    
    -- Plan restrictions
    applicable_plans TEXT[] DEFAULT ARRAY['gold', 'diamond', 'couple'],
    
    -- Stripe integration
    stripe_coupon_id VARCHAR(255),
    
    -- Validity
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid ON coupons(valid_from, valid_until);

-- Create payment_methods table for stored payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment method details
    stripe_payment_method_id VARCHAR(255),
    type VARCHAR(20) CHECK (type IN ('card', 'pix', 'boleto')) DEFAULT 'card',
    
    -- Card details (for display only - never store full card data)
    brand VARCHAR(50), -- visa, mastercard, etc.
    last_four VARCHAR(4),
    exp_month INTEGER CHECK (exp_month >= 1 AND exp_month <= 12),
    exp_year INTEGER CHECK (exp_year >= 2024),
    
    -- Status
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Billing address (optional)
    billing_address JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = true;

-- Create invoices table for billing records
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Invoice details
    invoice_number VARCHAR(50) UNIQUE,
    stripe_invoice_id VARCHAR(255),
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    amount_due DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Status
    status VARCHAR(20) CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')) DEFAULT 'draft',
    
    -- Description and metadata
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- URLs and files
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    
    -- Payment
    payment_intent_id VARCHAR(255),
    payment_method_id UUID REFERENCES payment_methods(id),
    
    -- Billing period
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    
    -- Due date
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);

-- Create invoice_line_items table for detailed billing
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Item details
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_amount DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Period (for subscriptions)
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for invoice_line_items
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- Create coupon_usage table to track coupon redemptions
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    
    -- Discount applied
    discount_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Usage timestamp
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for coupon_usage
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_subscription_id ON coupon_usage(subscription_id);

-- Update existing subscriptions table to fix field naming inconsistencies
-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add provider_subscription_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'provider_subscription_id') THEN
        ALTER TABLE subscriptions ADD COLUMN provider_subscription_id VARCHAR(255);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_id ON subscriptions(provider_subscription_id);
    END IF;
    
    -- Add discount_percentage if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'discount_percentage') THEN
        ALTER TABLE subscriptions ADD COLUMN discount_percentage INTEGER DEFAULT 0;
    END IF;
    
    -- Add final_amount if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'final_amount') THEN
        ALTER TABLE subscriptions ADD COLUMN final_amount DECIMAL(10,2);
    END IF;
    
    -- Add cancel_at_period_end if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end') THEN
        ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing payment_history table to fix field naming
DO $$ 
BEGIN
    -- Add provider_payment_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_history' AND column_name = 'provider_payment_id') THEN
        ALTER TABLE payment_history ADD COLUMN provider_payment_id VARCHAR(255);
        CREATE INDEX IF NOT EXISTS idx_payment_history_provider_id ON payment_history(provider_payment_id);
    END IF;
    
    -- Add error_message if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_history' AND column_name = 'error_message') THEN
        ALTER TABLE payment_history ADD COLUMN error_message TEXT;
    END IF;
    
    -- Add paid_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_history' AND column_name = 'paid_at') THEN
        ALTER TABLE payment_history ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- RLS Policies for new tables

-- webhook_events policies (admin only)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage webhook events" ON webhook_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- coupons policies (admin only)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage coupons" ON coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can view active coupons" ON coupons
    FOR SELECT USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

-- payment_methods policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payment methods" ON payment_methods
    FOR ALL USING (user_id = auth.uid());

-- invoices policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all invoices" ON invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- invoice_line_items policies
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoice line items" ON invoice_line_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_line_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Admin can manage all invoice line items" ON invoice_line_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- coupon_usage policies
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon usage" ON coupon_usage
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all coupon usage" ON coupon_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Functions for triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON webhook_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('invoice_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Add trigger for invoice number generation
CREATE TRIGGER generate_invoice_number_trigger BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        -- Set all other payment methods for this user to not default
        UPDATE payment_methods 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for default payment method
CREATE TRIGGER ensure_single_default_payment_method_trigger 
    BEFORE INSERT OR UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment_method();

-- Function to update coupon usage count
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE coupons 
    SET times_redeemed = times_redeemed + 1 
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for coupon usage count
CREATE TRIGGER update_coupon_usage_count_trigger 
    AFTER INSERT ON coupon_usage
    FOR EACH ROW EXECUTE FUNCTION update_coupon_usage_count();

-- Add comments for documentation
COMMENT ON TABLE webhook_events IS 'Logs all payment webhook events for debugging and audit purposes';
COMMENT ON TABLE coupons IS 'Discount coupons and promotional codes';
COMMENT ON TABLE payment_methods IS 'Stored payment methods for users (cards, PIX, etc.)';
COMMENT ON TABLE invoices IS 'Billing invoices and receipts';
COMMENT ON TABLE invoice_line_items IS 'Detailed line items for invoices';
COMMENT ON TABLE coupon_usage IS 'Tracks when and how coupons are used';