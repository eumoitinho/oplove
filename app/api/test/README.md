# OpenLove Payment Testing API Routes

This directory contains testing routes for payment integrations. **These routes only work in development environment** (`NODE_ENV=development`).

## 🚀 Quick Start

1. **Access the Testing Dashboard:**
   ```
   http://localhost:3003/api/test/payment-dashboard
   ```

2. **Or use the API endpoints directly:**
   - Stripe Tests: `POST /api/test/stripe-subscription`
   - PIX Tests: `POST /api/test/abacatepay-pix`

## 📋 Available Test Routes

### 1. Payment Dashboard (`/api/test/payment-dashboard`)
- **Method:** GET
- **Description:** Interactive HTML dashboard for testing payments
- **Features:**
  - Visual forms for both Stripe and PIX testing
  - Real-time result display with detailed logs
  - Test history tracking
  - Manual PIX payment simulation
  - QR code display for PIX payments

### 2. Stripe Subscription Test (`/api/test/stripe-subscription`)
- **Method:** POST
- **Description:** Test Stripe subscription creation with various scenarios

#### Request Body:
```json
{
  "plan": "gold|diamond|couple",
  "test_scenario": "success|decline_generic|decline_insufficient_funds|decline_lost_card|decline_stolen_card|require_authentication|charge_dispute",
  "customer_email": "test@example.com",
  "billing_cycle": "monthly|yearly"
}
```

#### Test Scenarios:
- `success` - Payment succeeds (4242424242424242)
- `decline_generic` - Generic decline (4000000000000002)
- `decline_insufficient_funds` - Insufficient funds (4000000000009995)
- `decline_lost_card` - Lost card (4000000000009987)
- `decline_stolen_card` - Stolen card (4000000000009979)
- `require_authentication` - Requires 3D Secure (4000002500003155)
- `charge_dispute` - Future dispute (4000000000000259)

### 3. AbacatePay PIX Test (`/api/test/abacatepay-pix`)
- **Method:** POST
- **Description:** Create PIX payment with automatic simulation

#### Request Body:
```json
{
  "plan": "gold|diamond|couple",
  "customer_email": "test@example.com",
  "customer_name": "João Test",
  "customer_document": "12345678900",
  "billing_cycle": "monthly|yearly",
  "simulate_payment": true,
  "simulate_delay": 30
}
```

#### Additional Method: PUT
- **URL:** `/api/test/abacatepay-pix?payment_id={payment_id}`
- **Description:** Manually simulate payment completion

## 🏗️ System Architecture

### Test Flow:
1. **Stripe Tests:**
   - Create test customer
   - Attach test payment method  
   - Create subscription
   - Process payment with selected scenario

2. **PIX Tests:**
   - Generate PIX payment via AbacatePay
   - Store in database (`pix_payments` table)
   - Generate QR code
   - Optionally simulate payment completion via webhook

### Database Schema:
The PIX tests use the `pix_payments` table:
```sql
CREATE TABLE pix_payments (
  id UUID PRIMARY KEY,
  external_id TEXT UNIQUE,
  abacatepay_id TEXT UNIQUE,
  amount DECIMAL(10,2),
  status TEXT,
  pix_code TEXT,
  qr_code_image TEXT,
  is_test BOOLEAN,
  -- ... more fields
);
```

## 🔧 Configuration

### Required Environment Variables:
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_GOLD_MONTHLY=price_...
STRIPE_PRICE_DIAMOND_MONTHLY=price_...
STRIPE_PRICE_COUPLE_MONTHLY=price_...

# AbacatePay  
ABACATEPAY_API_KEY=abc_dev_...
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

### Development Only:
All test routes check for `NODE_ENV=development` and will return 403 in production.

## 📊 Plan Pricing

| Plan | Monthly | Yearly |
|------|---------|--------|
| Gold | R$ 25.00 | R$ 270.00 |
| Diamond | R$ 45.00 | R$ 486.00 |
| Couple | R$ 69.90 | R$ 754.92 |

## 🧪 Testing Scenarios

### Stripe Test Cards:
- **Success:** 4242424242424242
- **Generic Decline:** 4000000000000002  
- **Insufficient Funds:** 4000000000009995
- **Lost Card:** 4000000000009987
- **3D Secure:** 4000002500003155

### PIX Testing:
- Real QR codes are generated
- Automatic webhook simulation after configurable delay
- Manual payment completion via PUT endpoint
- All test payments marked with `is_test: true`

## 🔍 Response Format

All endpoints return consistent JSON responses:
```json
{
  "success": boolean,
  "data": {...}, // Success data
  "error": "string", // Error message if failed
  "logs": ["string"] // Detailed step-by-step logs
}
```

## 🐛 Debugging

### Common Issues:
1. **403 Forbidden:** Not in development environment
2. **Missing Environment Variables:** Check Stripe/AbacatePay keys
3. **Webhook Failures:** Ensure NEXT_PUBLIC_APP_URL is correct
4. **Database Errors:** Run PIX payments migration

### Logs:
All endpoints provide detailed logs array showing each step:
- `INFO:` - General information
- `SUCCESS:` - Successful operations
- `WARNING:` - Non-critical issues  
- `ERROR:` - Failures
- `STEP X:` - Major process steps

## 📱 Usage Examples

### Test Stripe Success:
```bash
curl -X POST http://localhost:3003/api/test/stripe-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "gold",
    "test_scenario": "success",
    "customer_email": "test@example.com"
  }'
```

### Test PIX with Auto-simulation:
```bash
curl -X POST http://localhost:3003/api/test/abacatepay-pix \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "diamond",
    "customer_email": "test@example.com",
    "customer_name": "João Test",
    "simulate_payment": true,
    "simulate_delay": 30
  }'
```

### Manual PIX Simulation:
```bash
curl -X PUT "http://localhost:3003/api/test/abacatepay-pix?payment_id=abc_123456"
```

## 🚨 Security Notes

- Routes are development-only (NODE_ENV check)
- Test data clearly marked in database
- No sensitive data exposed in logs
- Webhook signatures validated
- RLS policies applied to test data

## 📚 Documentation References

- [Stripe Testing Cards](https://docs.stripe.com/testing?locale=pt-BR)
- [AbacatePay PIX Simulation](https://docs.abacatepay.com/pages/pix-qrcode/simulate-payment)
- [OpenLove Payment Architecture](../v1/docs/endpoints/payments.docs.ts)