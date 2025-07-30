#!/bin/bash
# Script para criar produtos e preços na Stripe via API
# Execute: bash scripts/create-stripe-products.sh

# Carrega variáveis do .env.local
export $(grep -v '^#' .env.local | xargs)

echo "🚀 Criando produtos na Stripe..."
echo "🔑 Usando chave: ${STRIPE_SECRET_KEY:0:12}..."

# Função para criar produto
create_product() {
    local name="$1"
    local description="$2"
    
    curl -s https://api.stripe.com/v1/products \
        -u "$STRIPE_SECRET_KEY:" \
        -d "name=$name" \
        -d "description=$description"
}

# Função para criar preço
create_price() {
    local product_id="$1"
    local amount="$2"
    local interval="$3"
    local interval_count="$4"
    
    curl -s https://api.stripe.com/v1/prices \
        -u "$STRIPE_SECRET_KEY:" \
        -d "product=$product_id" \
        -d "unit_amount=$amount" \
        -d "currency=brl" \
        -d "recurring[interval]=$interval" \
        -d "recurring[interval_count]=$interval_count"
}

echo ""
echo "📦 Criando produto: OpenLove Gold"
GOLD_PRODUCT=$(create_product "OpenLove Gold" "Plano Gold - Recursos premium básicos")
GOLD_ID=$(echo $GOLD_PRODUCT | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Produto Gold criado: $GOLD_ID"

echo ""
echo "💰 Criando preços para Gold..."
GOLD_MONTHLY=$(create_price "$GOLD_ID" "2500" "month" "1")
GOLD_MONTHLY_ID=$(echo $GOLD_MONTHLY | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Mensal: $GOLD_MONTHLY_ID"

GOLD_QUARTERLY=$(create_price "$GOLD_ID" "6750" "month" "3")  
GOLD_QUARTERLY_ID=$(echo $GOLD_QUARTERLY | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Trimestral: $GOLD_QUARTERLY_ID"

GOLD_SEMIANNUAL=$(create_price "$GOLD_ID" "12750" "month" "6")
GOLD_SEMIANNUAL_ID=$(echo $GOLD_SEMIANNUAL | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Semestral: $GOLD_SEMIANNUAL_ID"

GOLD_ANNUAL=$(create_price "$GOLD_ID" "24000" "year" "1")
GOLD_ANNUAL_ID=$(echo $GOLD_ANNUAL | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Anual: $GOLD_ANNUAL_ID"

echo ""
echo "📦 Criando produto: OpenLove Diamond"  
DIAMOND_PRODUCT=$(create_product "OpenLove Diamond" "Plano Diamond - Recursos premium completos")
DIAMOND_ID=$(echo $DIAMOND_PRODUCT | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Produto Diamond criado: $DIAMOND_ID"

echo ""
echo "💰 Criando preços para Diamond..."
DIAMOND_MONTHLY=$(create_price "$DIAMOND_ID" "4500" "month" "1")
DIAMOND_MONTHLY_ID=$(echo $DIAMOND_MONTHLY | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Mensal: $DIAMOND_MONTHLY_ID"

DIAMOND_QUARTERLY=$(create_price "$DIAMOND_ID" "12150" "month" "3")
DIAMOND_QUARTERLY_ID=$(echo $DIAMOND_QUARTERLY | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Trimestral: $DIAMOND_QUARTERLY_ID"

DIAMOND_SEMIANNUAL=$(create_price "$DIAMOND_ID" "22950" "month" "6")
DIAMOND_SEMIANNUAL_ID=$(echo $DIAMOND_SEMIANNUAL | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Semestral: $DIAMOND_SEMIANNUAL_ID"

DIAMOND_ANNUAL=$(create_price "$DIAMOND_ID" "43200" "year" "1")
DIAMOND_ANNUAL_ID=$(echo $DIAMOND_ANNUAL | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Anual: $DIAMOND_ANNUAL_ID"

echo ""
echo "📦 Criando produto: OpenLove Dupla Hot"
COUPLE_PRODUCT=$(create_product "OpenLove Dupla Hot" "Plano Dupla Hot - Para duas contas")
COUPLE_ID=$(echo $COUPLE_PRODUCT | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Produto Dupla Hot criado: $COUPLE_ID"

echo ""
echo "💰 Criando preços para Dupla Hot..."
COUPLE_MONTHLY=$(create_price "$COUPLE_ID" "6990" "month" "1")
COUPLE_MONTHLY_ID=$(echo $COUPLE_MONTHLY | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Mensal: $COUPLE_MONTHLY_ID"

COUPLE_QUARTERLY=$(create_price "$COUPLE_ID" "18873" "month" "3")
COUPLE_QUARTERLY_ID=$(echo $COUPLE_QUARTERLY | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Trimestral: $COUPLE_QUARTERLY_ID"

COUPLE_SEMIANNUAL=$(create_price "$COUPLE_ID" "35649" "month" "6")
COUPLE_SEMIANNUAL_ID=$(echo $COUPLE_SEMIANNUAL | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Semestral: $COUPLE_SEMIANNUAL_ID"

COUPLE_ANNUAL=$(create_price "$COUPLE_ID" "67104" "year" "1")
COUPLE_ANNUAL_ID=$(echo $COUPLE_ANNUAL | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  ✅ Anual: $COUPLE_ANNUAL_ID"

echo ""
echo "🎉 Todos os produtos e preços foram criados!"
echo ""
echo "📝 Adicione estas variáveis ao seu .env.local:"
echo ""
echo "# Stripe Products"
echo "STRIPE_PRODUCT_GOLD=$GOLD_ID"
echo "STRIPE_PRODUCT_DIAMOND=$DIAMOND_ID"  
echo "STRIPE_PRODUCT_COUPLE=$COUPLE_ID"
echo ""
echo "# Stripe Price IDs Gold"
echo "STRIPE_PRICE_GOLD_MONTHLY=$GOLD_MONTHLY_ID"
echo "STRIPE_PRICE_GOLD_QUARTERLY=$GOLD_QUARTERLY_ID" 
echo "STRIPE_PRICE_GOLD_SEMIANNUAL=$GOLD_SEMIANNUAL_ID"
echo "STRIPE_PRICE_GOLD_ANNUAL=$GOLD_ANNUAL_ID"
echo ""
echo "# Stripe Price IDs Diamond"
echo "STRIPE_PRICE_DIAMOND_MONTHLY=$DIAMOND_MONTHLY_ID"
echo "STRIPE_PRICE_DIAMOND_QUARTERLY=$DIAMOND_QUARTERLY_ID"
echo "STRIPE_PRICE_DIAMOND_SEMIANNUAL=$DIAMOND_SEMIANNUAL_ID" 
echo "STRIPE_PRICE_DIAMOND_ANNUAL=$DIAMOND_ANNUAL_ID"
echo ""
echo "# Stripe Price IDs Dupla Hot"
echo "STRIPE_PRICE_COUPLE_MONTHLY=$COUPLE_MONTHLY_ID"
echo "STRIPE_PRICE_COUPLE_QUARTERLY=$COUPLE_QUARTERLY_ID"
echo "STRIPE_PRICE_COUPLE_SEMIANNUAL=$COUPLE_SEMIANNUAL_ID"
echo "STRIPE_PRICE_COUPLE_ANNUAL=$COUPLE_ANNUAL_ID"