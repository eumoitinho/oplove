-- =====================================================
-- OPENLOVE ADMIN, BUSINESS & OPEN DATES SCHEMA
-- Complemento ao schema principal
-- =====================================================

-- =====================================================
-- NOVOS ENUM TYPES
-- =====================================================

-- Tipos de conta
CREATE TYPE account_type AS ENUM ('personal', 'business');
CREATE TYPE business_type AS ENUM ('venue', 'content_creator', 'service_provider', 'event_organizer', 'brand', 'influencer');

-- Tipos de transações
CREATE TYPE transaction_type AS ENUM ('purchase', 'spend', 'refund', 'bonus', 'commission');
CREATE TYPE credit_transaction_type AS ENUM ('purchase', 'spend', 'refund', 'bonus');

-- Tipos de ações do Open Dates
CREATE TYPE swipe_action AS ENUM ('like', 'super_like', 'pass');
CREATE TYPE match_status AS ENUM ('active', 'expired', 'unmatched');

-- Tipos de conteúdo pago
CREATE TYPE paid_content_type AS ENUM ('photo', 'video', 'album', 'live');
CREATE TYPE content_category AS ENUM ('artistic', 'sensual', 'fitness', 'lifestyle', 'educational', 'entertainment');
CREATE TYPE content_status AS ENUM ('draft', 'active', 'paused', 'archived', 'removed');

-- Tipos administrativos
CREATE TYPE admin_department AS ENUM ('financial', 'moderation', 'support', 'marketing', 'technical', 'management');
CREATE TYPE admin_action_type AS ENUM ('view', 'create', 'update', 'delete', 'ban', 'unban', 'verify', 'reject', 'refund');

-- Objetivos de campanha
CREATE TYPE campaign_objective AS ENUM ('awareness', 'traffic', 'conversion', 'engagement', 'app_installs');
CREATE TYPE ad_format AS ENUM ('timeline', 'sidebar', 'story', 'popup', 'native');

-- =====================================================
-- ALTERAÇÕES NAS TABELAS EXISTENTES
-- =====================================================

-- Adicionar tipo de conta à tabela users
ALTER TABLE users 
ADD COLUMN account_type account_type DEFAULT 'personal',
ADD COLUMN business_id UUID,
ADD COLUMN admin_id UUID;

-- =====================================================
-- TABELAS DE NEGÓCIOS
-- =====================================================

-- Tabela principal de empresas
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Identificação
    business_type business_type NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(200),
    cnpj VARCHAR(18) UNIQUE,
    
    -- Informações
    description TEXT,
    short_description VARCHAR(500),
    category VARCHAR(100),
    subcategories TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Localização (para venues físicos)
    address JSONB, -- {street, number, complement, neighborhood, city, state, zipCode}
    coordinates POINT,
    business_hours JSONB, -- {monday: {open: "18:00", close: "02:00"}, ...}
    service_area_radius INTEGER, -- em km
    
    -- Contato
    contact JSONB NOT NULL, -- {phone, whatsapp, email, website}
    social_links JSONB DEFAULT '{}', -- {instagram, facebook, twitter, tiktok, youtube}
    
    -- Verificação
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_level INTEGER DEFAULT 0, -- 0-3 (não verificado até totalmente verificado)
    verification_documents TEXT[] DEFAULT '{}',
    
    -- Mídia
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    
    -- Créditos e financeiro
    credit_balance INTEGER DEFAULT 0,
    total_credits_purchased INTEGER DEFAULT 0,
    total_credits_spent INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    
    -- Configurações e features
    settings JSONB DEFAULT '{
        "notifications": true,
        "auto_reply": false,
        "show_in_search": true,
        "allow_reviews": true
    }'::jsonb,
    
    features JSONB DEFAULT '{
        "can_sell_content": false,
        "can_create_events": true,
        "can_advertise": true,
        "can_have_store": false,
        "max_products": 0,
        "max_events_per_month": 10,
        "commission_rate": 0.20
    }'::jsonb,
    
    -- Estatísticas
    stats JSONB DEFAULT '{
        "total_followers": 0,
        "total_views": 0,
        "average_rating": 0,
        "total_reviews": 0,
        "total_sales": 0
    }'::jsonb,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
    suspension_reason TEXT,
    
    -- SEO
    slug VARCHAR(100) UNIQUE,
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de equipe/funcionários do business
CREATE TABLE business_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Papel e permissões
    role VARCHAR(50) NOT NULL, -- owner, manager, employee, dj, photographer, etc
    permissions JSONB DEFAULT '{}'::jsonb,
    
    -- Informações
    department VARCHAR(100),
    title VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_business_team_member UNIQUE (business_id, user_id)
);

-- =====================================================
-- SISTEMA DE CRÉDITOS
-- =====================================================

-- Pacotes de créditos disponíveis
CREATE TABLE credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Detalhes do pacote
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    bonus_credits INTEGER DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    
    -- Configurações
    is_active BOOLEAN DEFAULT true,
    is_promotional BOOLEAN DEFAULT false,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Descrição
    description TEXT,
    features TEXT[] DEFAULT '{}',
    
    -- Ordem de exibição
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transações de créditos
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Tipo de transação
    type credit_transaction_type NOT NULL,
    amount INTEGER NOT NULL, -- Positivo para entrada, negativo para saída
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    -- Detalhes da transação
    description TEXT NOT NULL,
    reference_id UUID, -- ID do anúncio, campanha, etc
    reference_type VARCHAR(50), -- 'campaign', 'ad', 'boost', etc
    
    -- Para compras
    package_id UUID REFERENCES credit_packages(id),
    payment_method payment_method,
    payment_amount DECIMAL(10, 2),
    payment_status VARCHAR(20),
    payment_reference VARCHAR(255), -- ID do pagamento no gateway
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custos de ações em créditos
CREATE TABLE credit_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ação
    action_type VARCHAR(50) NOT NULL UNIQUE, -- 'timeline_ad', 'sidebar_ad', 'event_boost', etc
    category VARCHAR(50) NOT NULL,
    
    -- Custo
    credit_cost INTEGER NOT NULL,
    unit VARCHAR(20) DEFAULT 'unit', -- 'unit', '1000_impressions', 'day', etc
    
    -- Configurações
    is_active BOOLEAN DEFAULT true,
    min_purchase INTEGER DEFAULT 1,
    max_purchase INTEGER,
    
    -- Descrição
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- OPEN DATES (SISTEMA DE MATCH)
-- =====================================================

-- Perfis de dating
CREATE TABLE dating_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    visibility VARCHAR(20) DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden', 'paused')),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Preferências de match
    preferences JSONB NOT NULL DEFAULT '{
        "age_range": {"min": 18, "max": 99},
        "distance": 50,
        "distance_unit": "km",
        "genders": [],
        "interests": [],
        "relationship_goals": [],
        "languages": ["pt"],
        "show_me_in_searches": true
    }'::jsonb,
    
    -- Perfil de dating
    bio TEXT, -- Máximo 500 caracteres
    prompts JSONB DEFAULT '[]'::jsonb, -- [{question: "...", answer: "..."}]
    
    -- Fotos específicas para dating (ordem importa)
    photos JSONB DEFAULT '[]'::jsonb, -- [{url: "...", caption: "...", is_verified: false}]
    
    -- Verificação de foto
    photo_verified BOOLEAN DEFAULT false,
    photo_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Localização
    current_location POINT,
    current_location_name VARCHAR(255),
    passport_location POINT, -- Feature Diamond: mudar localização
    passport_location_name VARCHAR(255),
    
    -- Limites diários (resetam à meia-noite)
    daily_likes_limit INTEGER DEFAULT 50,
    daily_likes_used INTEGER DEFAULT 0,
    daily_super_likes_limit INTEGER DEFAULT 5,
    daily_super_likes_used INTEGER DEFAULT 0,
    daily_rewinds_limit INTEGER DEFAULT 3,
    daily_rewinds_used INTEGER DEFAULT 0,
    last_limit_reset DATE DEFAULT CURRENT_DATE,
    
    -- Boost
    boost_active BOOLEAN DEFAULT false,
    boost_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Estatísticas
    stats JSONB DEFAULT '{
        "total_likes_given": 0,
        "total_likes_received": 0,
        "total_super_likes_given": 0,
        "total_super_likes_received": 0,
        "total_matches": 0,
        "total_messages_sent": 0,
        "total_messages_received": 0,
        "profile_views": 0,
        "conversion_rate": 0
    }'::jsonb,
    
    -- Configurações
    settings JSONB DEFAULT '{
        "auto_play_videos": true,
        "show_distance": true,
        "show_age": true,
        "show_recently_active": true,
        "smart_photos": false,
        "top_picks_notifications": true
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swipes/Likes do Open Dates
CREATE TABLE dating_swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID REFERENCES users(id) ON DELETE CASCADE,
    swiped_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ação
    action swipe_action NOT NULL,
    
    -- Contexto
    shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    swiped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_to_swipe INTEGER, -- Segundos desde shown_at até swiped_at
    
    -- Match
    is_match BOOLEAN DEFAULT false,
    matched_at TIMESTAMP WITH TIME ZONE,
    match_id UUID REFERENCES dating_matches(id),
    
    -- Localização no momento do swipe
    swiper_location POINT,
    distance_km FLOAT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Pode incluir algoritmo usado, score, etc
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_swipe UNIQUE (swiper_id, swiped_id),
    CONSTRAINT no_self_swipe CHECK (swiper_id != swiped_id)
);

-- Matches
CREATE TABLE dating_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    status match_status DEFAULT 'active',
    
    -- Tipo de match
    match_type VARCHAR(20) DEFAULT 'regular' CHECK (match_type IN ('regular', 'super_like', 'top_pick')),
    
    -- Interação
    last_interaction TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0,
    conversation_id UUID REFERENCES conversations(id),
    
    -- Unmatch
    unmatched_by UUID REFERENCES users(id),
    unmatched_at TIMESTAMP WITH TIME ZONE,
    unmatch_reason VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id),
    CONSTRAINT no_self_match CHECK (user1_id != user2_id),
    CONSTRAINT ordered_users CHECK (user1_id < user2_id)
);

-- Top Picks (recomendações especiais diárias)
CREATE TABLE dating_top_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pick_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Detalhes
    score FLOAT NOT NULL, -- Score do algoritmo
    reasons TEXT[] DEFAULT '{}', -- Razões da recomendação
    
    -- Status
    is_viewed BOOLEAN DEFAULT false,
    is_swiped BOOLEAN DEFAULT false,
    swipe_action swipe_action,
    
    -- Validade
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_daily_pick UNIQUE (user_id, pick_user_id, created_at::date)
);

-- =====================================================
-- MARKETPLACE DE CONTEÚDO
-- =====================================================

-- Conteúdo pago
CREATE TABLE paid_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id),
    
    -- Identificação
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE,
    description TEXT,
    
    -- Categorização
    category content_category NOT NULL,
    subcategory VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    is_adult BOOLEAN DEFAULT false,
    
    -- Mídia
    preview_urls TEXT[] NOT NULL, -- URLs das prévias (com marca d'água)
    preview_type VARCHAR(20), -- 'blurred', 'watermarked', 'cropped'
    content_urls TEXT[] NOT NULL, -- URLs do conteúdo completo
    content_type paid_content_type NOT NULL,
    
    -- Detalhes da mídia
    duration INTEGER, -- Para vídeos, em segundos
    file_sizes INTEGER[], -- Tamanhos dos arquivos em bytes
    dimensions JSONB, -- {width, height} para fotos/vídeos
    item_count INTEGER DEFAULT 1, -- Número de itens (para álbuns)
    
    -- Preço e vendas
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Promoções
    discount_percentage INTEGER CHECK (discount_percentage BETWEEN 0 AND 90),
    discount_valid_until TIMESTAMP WITH TIME ZONE,
    promo_code VARCHAR(50),
    
    -- Vendas e estatísticas
    sales_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    
    -- Avaliações
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- Configurações
    settings JSONB DEFAULT '{
        "allow_comments": true,
        "allow_ratings": true,
        "allow_downloads": false,
        "watermark": true,
        "drm_protected": false
    }'::jsonb,
    
    -- Exclusividade e disponibilidade
    is_exclusive BOOLEAN DEFAULT false,
    available_until TIMESTAMP WITH TIME ZONE,
    stock_limit INTEGER, -- Para conteúdo limitado
    stock_sold INTEGER DEFAULT 0,
    
    -- Status
    status content_status DEFAULT 'draft',
    rejection_reason TEXT,
    
    -- SEO
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compras de conteúdo
CREATE TABLE content_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES paid_content(id) ON DELETE CASCADE,
    
    -- Valores
    amount_paid DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Pagamento
    payment_method payment_method NOT NULL,
    payment_reference VARCHAR(255),
    
    -- Comissões
    platform_fee DECIMAL(10, 2) NOT NULL,
    platform_fee_percentage DECIMAL(5, 2) NOT NULL,
    creator_revenue DECIMAL(10, 2) NOT NULL,
    
    -- Acesso
    access_expires_at TIMESTAMP WITH TIME ZONE, -- Para conteúdo com acesso temporário
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 3,
    last_accessed TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'disputed')),
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_content_purchase UNIQUE (buyer_id, content_id)
);

-- Avaliações de conteúdo
CREATE TABLE content_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES paid_content(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES content_purchases(id) ON DELETE CASCADE,
    
    -- Avaliação
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    
    -- Útil/Não útil
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    
    -- Status
    is_verified_purchase BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_content_review UNIQUE (content_id, buyer_id)
);

-- Assinaturas de criadores
CREATE TABLE creator_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id),
    
    -- Plano
    tier VARCHAR(50) NOT NULL, -- 'basic', 'vip', 'premium'
    price DECIMAL(10, 2) NOT NULL,
    billing_period billing_period NOT NULL,
    
    -- Status
    status subscription_status DEFAULT 'active',
    
    -- Benefícios
    benefits JSONB DEFAULT '{}', -- {access_all_content: true, exclusive_content: true, etc}
    
    -- Pagamento
    payment_method payment_method,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Períodos
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Cancelamento
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_creator_subscription UNIQUE (subscriber_id, creator_id)
);

-- =====================================================
-- SISTEMA DE ANÚNCIOS EMPRESARIAIS
-- =====================================================

-- Campanhas de anúncios
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Identificação
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Objetivo e configuração
    objective campaign_objective NOT NULL,
    
    -- Orçamento (em créditos)
    total_budget INTEGER NOT NULL,
    daily_budget INTEGER,
    spent_credits INTEGER DEFAULT 0,
    
    -- Programação
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    schedule_hours INTEGER[], -- Horas do dia (0-23) para exibir
    schedule_days INTEGER[], -- Dias da semana (0-6) para exibir
    
    -- Segmentação
    targeting JSONB NOT NULL DEFAULT '{
        "demographics": {
            "age_min": 18,
            "age_max": 65,
            "genders": [],
            "relationship_status": []
        },
        "location": {
            "cities": [],
            "states": [],
            "radius_km": null,
            "exclude_locations": []
        },
        "interests": [],
        "behaviors": {
            "premium_users_only": false,
            "verified_only": false,
            "active_last_days": 30
        }
    }'::jsonb,
    
    -- Performance
    metrics JSONB DEFAULT '{
        "impressions": 0,
        "clicks": 0,
        "conversions": 0,
        "spent": 0,
        "ctr": 0,
        "cpc": 0,
        "roi": 0
    }'::jsonb,
    
    -- Otimização
    optimization_goal VARCHAR(50), -- 'clicks', 'impressions', 'conversions'
    bid_strategy VARCHAR(50) DEFAULT 'automatic', -- 'automatic', 'manual'
    max_bid_amount INTEGER, -- Máximo de créditos por ação
    
    -- Status
    status ad_status DEFAULT 'draft',
    approval_status VARCHAR(20) DEFAULT 'pending',
    rejection_reasons TEXT[],
    
    -- Timestamps
    approved_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anúncios individuais
CREATE TABLE business_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Formato e posicionamento
    format ad_format NOT NULL,
    placement_priority INTEGER DEFAULT 5, -- 1-10, maior = mais prioritário
    
    -- Conteúdo baseado no formato
    content JSONB NOT NULL, -- Estrutura varia por formato
    /*
    Para timeline: {
        title: string,
        description: string,
        media_url: string,
        media_type: 'image' | 'video',
        cta_text: string,
        cta_url: string
    }
    
    Para sidebar: {
        banner_url: string,
        alt_text: string,
        click_url: string
    }
    
    Para story: {
        media_url: string,
        media_type: 'image' | 'video',
        duration: number, // segundos
        cta_text: string,
        cta_url: string,
        interactive_elements: []
    }
    */
    
    -- Variações para teste A/B
    variations JSONB DEFAULT '[]', -- Array de variações do conteúdo
    winning_variation INTEGER,
    
    -- Performance individual
    impressions INTEGER DEFAULT 0,
    unique_impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    credits_spent INTEGER DEFAULT 0,
    
    -- Métricas detalhadas
    metrics_by_day JSONB DEFAULT '{}', -- {date: {impressions, clicks, spent}}
    metrics_by_hour JSONB DEFAULT '{}', -- {hour: {impressions, clicks, spent}}
    metrics_by_placement JSONB DEFAULT '{}', -- {placement: {impressions, clicks}}
    
    -- Status
    status ad_status DEFAULT 'draft',
    quality_score INTEGER, -- 1-10, baseado em CTR e relevância
    
    -- Timestamps
    first_served_at TIMESTAMP WITH TIME ZONE,
    last_served_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Impressões e interações de anúncios
CREATE TABLE ad_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES business_ads(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    -- Tipo de interação
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('impression', 'click', 'conversion', 'dismiss', 'report')),
    
    -- Contexto
    placement VARCHAR(50) NOT NULL, -- Onde foi exibido
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    
    -- Para cliques
    click_position JSONB, -- {x, y} relativo ao anúncio
    time_to_click INTEGER, -- Segundos desde a impressão
    
    -- Para conversões
    conversion_type VARCHAR(50), -- 'signup', 'purchase', 'visit', etc
    conversion_value DECIMAL(10, 2),
    
    -- Localização
    user_location POINT,
    distance_from_business FLOAT,
    
    -- Metadata
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SISTEMA ADMINISTRATIVO
-- =====================================================

-- Usuários administrativos
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Identificação
    employee_id VARCHAR(50) UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    
    -- Níveis e departamentos
    access_level INTEGER NOT NULL CHECK (access_level BETWEEN 1 AND 5), -- 1=básico, 5=super admin
    departments admin_department[] NOT NULL,
    is_department_head BOOLEAN DEFAULT false,
    
    -- Permissões detalhadas
    permissions JSONB NOT NULL DEFAULT '{
        "users": {
            "view": false,
            "edit": false,
            "ban": false,
            "delete": false,
            "impersonate": false
        },
        "content": {
            "view": false,
            "moderate": false,
            "delete": false
        },
        "financial": {
            "view": false,
            "refund": false,
            "reports": false
        },
        "business": {
            "view": false,
            "verify": false,
            "suspend": false
        },
        "system": {
            "settings": false,
            "logs": false,
            "backups": false
        }
    }'::jsonb,
    
    -- Auditoria
    last_login TIMESTAMP WITH TIME ZONE,
    last_ip INET,
    login_count INTEGER DEFAULT 0,
    actions_count INTEGER DEFAULT 0,
    
    -- Segurança
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    must_change_password BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    deactivated_at TIMESTAMP WITH TIME ZONE,
    deactivation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de ações administrativas
CREATE TABLE admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id),
    
    -- Ação
    action admin_action_type NOT NULL,
    action_description TEXT NOT NULL,
    
    -- Alvo da ação
    target_type VARCHAR(50) NOT NULL, -- 'user', 'post', 'business', etc
    target_id UUID,
    target_data JSONB, -- Snapshot dos dados antes da ação
    
    -- Mudanças
    changes JSONB, -- {field: {old_value, new_value}}
    
    -- Contexto
    reason TEXT,
    notes TEXT,
    
    -- Auditoria
    ip_address INET NOT NULL,
    user_agent TEXT,
    request_id UUID, -- Para rastrear ações relacionadas
    
    -- Status
    was_successful BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard de métricas administrativas
CREATE TABLE admin_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Período
    metric_date DATE NOT NULL,
    metric_hour INTEGER, -- Para métricas horárias
    
    -- Usuários
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    premium_users INTEGER DEFAULT 0,
    verified_users INTEGER DEFAULT 0,
    
    -- Financeiro
    revenue_total DECIMAL(12, 2) DEFAULT 0,
    revenue_subscriptions DECIMAL(12, 2) DEFAULT 0,
    revenue_credits DECIMAL(12, 2) DEFAULT 0,
    revenue_content DECIMAL(12, 2) DEFAULT 0,
    refunds_total DECIMAL(12, 2) DEFAULT 0,
    
    -- Conteúdo
    posts_created INTEGER DEFAULT 0,
    posts_removed INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    
    -- Moderação
    reports_created INTEGER DEFAULT 0,
    reports_resolved INTEGER DEFAULT 0,
    users_banned INTEGER DEFAULT 0,
    content_removed INTEGER DEFAULT 0,
    
    -- Business
    businesses_total INTEGER DEFAULT 0,
    businesses_new INTEGER DEFAULT 0,
    businesses_verified INTEGER DEFAULT 0,
    ads_served INTEGER DEFAULT 0,
    
    -- Dating
    dating_profiles_active INTEGER DEFAULT 0,
    swipes_total INTEGER DEFAULT 0,
    matches_created INTEGER DEFAULT 0,
    
    -- Performance
    api_requests INTEGER DEFAULT 0,
    api_errors INTEGER DEFAULT 0,
    average_response_time FLOAT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_metric_period UNIQUE (metric_date, metric_hour)
);

-- Relatórios financeiros
CREATE TABLE financial_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Período
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Receitas
    revenue JSONB NOT NULL DEFAULT '{
        "subscriptions": {
            "gold": {"count": 0, "amount": 0},
            "diamond": {"count": 0, "amount": 0},
            "couple": {"count": 0, "amount": 0}
        },
        "credits": {
            "packages_sold": 0,
            "amount": 0
        },
        "content": {
            "sales_count": 0,
            "gross_amount": 0,
            "commission": 0
        },
        "total": 0
    }'::jsonb,
    
    -- Despesas
    expenses JSONB DEFAULT '{
        "payment_processing": 0,
        "refunds": 0,
        "chargebacks": 0,
        "operational": 0
    }'::jsonb,
    
    -- Métricas
    metrics JSONB DEFAULT '{
        "arpu": 0,
        "ltv": 0,
        "cac": 0,
        "mrr": 0,
        "churn_rate": 0,
        "growth_rate": 0
    }'::jsonb,
    
    -- Status
    is_final BOOLEAN DEFAULT false,
    generated_by UUID REFERENCES admin_users(id),
    
    -- Timestamps
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNÇÕES E TRIGGERS ADICIONAIS
-- =====================================================

-- Função para validar limites do Open Dates
CREATE OR REPLACE FUNCTION check_dating_limits()
RETURNS TRIGGER AS $
DECLARE
    profile RECORD;
    user_premium RECORD;
BEGIN
    -- Buscar perfil e plano do usuário
    SELECT dp.*, u.premium_type, u.is_verified
    INTO profile
    FROM dating_profiles dp
    JOIN users u ON dp.user_id = u.id
    WHERE dp.user_id = NEW.swiper_id;
    
    -- Resetar limites se necessário
    IF profile.last_limit_reset < CURRENT_DATE THEN
        UPDATE dating_profiles
        SET 
            daily_likes_used = 0,
            daily_super_likes_used = 0,
            daily_rewinds_used = 0,
            last_limit_reset = CURRENT_DATE
        WHERE user_id = NEW.swiper_id;
        
        -- Recarregar profile
        SELECT * INTO profile
        FROM dating_profiles
        WHERE user_id = NEW.swiper_id;
    END IF;
    
    -- Verificar limites baseado no plano
    IF NEW.action = 'like' THEN
        IF profile.daily_likes_used >= profile.daily_likes_limit THEN
            RAISE EXCEPTION 'Daily like limit exceeded';
        END IF;
        
        UPDATE dating_profiles
        SET daily_likes_used = daily_likes_used + 1
        WHERE user_id = NEW.swiper_id;
        
    ELSIF NEW.action = 'super_like' THEN
        IF profile.daily_super_likes_used >= profile.daily_super_likes_limit THEN
            RAISE EXCEPTION 'Daily super like limit exceeded';
        END IF;
        
        UPDATE dating_profiles
        SET daily_super_likes_used = daily_super_likes_used + 1
        WHERE user_id = NEW.swiper_id;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_dating_limits
BEFORE INSERT ON dating_swipes
FOR EACH ROW EXECUTE FUNCTION check_dating_limits();

-- Função para criar match automaticamente
CREATE OR REPLACE FUNCTION create_dating_match()
RETURNS TRIGGER AS $
DECLARE
    other_swipe RECORD;
    match_id UUID;
BEGIN
    -- Só processa likes (não passes)
    IF NEW.action IN ('like', 'super_like') THEN
        -- Verificar se há like mútuo
        SELECT * INTO other_swipe
        FROM dating_swipes
        WHERE swiper_id = NEW.swiped_id
        AND swiped_id = NEW.swiper_id
        AND action IN ('like', 'super_like');
        
        IF FOUND THEN
            -- Criar match
            INSERT INTO dating_matches (
                user1_id,
                user2_id,
                match_type
            ) VALUES (
                LEAST(NEW.swiper_id, NEW.swiped_id),
                GREATEST(NEW.swiper_id, NEW.swiped_id),
                CASE 
                    WHEN NEW.action = 'super_like' OR other_swipe.action = 'super_like' 
                    THEN 'super_like' 
                    ELSE 'regular' 
                END
            ) RETURNING id INTO match_id;
            
            -- Atualizar ambos os swipes
            UPDATE dating_swipes
            SET 
                is_match = true,
                matched_at = NOW(),
                match_id = match_id
            WHERE (swiper_id = NEW.swiper_id AND swiped_id = NEW.swiped_id)
               OR (swiper_id = NEW.swiped_id AND swiped_id = NEW.swiper_id);
            
            -- Criar conversa automaticamente
            PERFORM create_conversation_for_match(match_id);
            
            -- Atualizar estatísticas
            UPDATE dating_profiles
            SET stats = jsonb_set(
                stats,
                '{total_matches}',
                (COALESCE((stats->>'total_matches')::int, 0) + 1)::text::jsonb
            )
            WHERE user_id IN (NEW.swiper_id, NEW.swiped_id);
        END IF;
    END IF;
    
    -- Atualizar estatísticas de likes dados
    UPDATE dating_profiles
    SET stats = jsonb_set(
        stats,
        CASE NEW.action 
            WHEN 'super_like' THEN '{total_super_likes_given}'
            ELSE '{total_likes_given}'
        END,
        (COALESCE((stats->>(
            CASE NEW.action 
                WHEN 'super_like' THEN 'total_super_likes_given'
                ELSE 'total_likes_given'
            END
        ))::int, 0) + 1)::text::jsonb
    )
    WHERE user_id = NEW.swiper_id;
    
    -- Atualizar estatísticas de likes recebidos
    IF NEW.action != 'pass' THEN
        UPDATE dating_profiles
        SET stats = jsonb_set(
            stats,
            CASE NEW.action 
                WHEN 'super_like' THEN '{total_super_likes_received}'
                ELSE '{total_likes_received}'
            END,
            (COALESCE((stats->>(
                CASE NEW.action 
                    WHEN 'super_like' THEN 'total_super_likes_received'
                    ELSE 'total_likes_received'
                END
            ))::int, 0) + 1)::text::jsonb
        )
        WHERE user_id = NEW.swiped_id;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_dating_match
AFTER INSERT ON dating_swipes
FOR EACH ROW EXECUTE FUNCTION create_dating_match();

-- Função para calcular comissão de conteúdo
CREATE OR REPLACE FUNCTION calculate_content_commission(
    p_creator_id UUID,
    p_amount DECIMAL,
    p_content_type paid_content_type
) RETURNS TABLE (
    platform_fee DECIMAL,
    creator_revenue DECIMAL
) AS $
DECLARE
    commission_rate DECIMAL;
    is_verified BOOLEAN;
    is_business_verified BOOLEAN;
    total_sales INTEGER;
BEGIN
    -- Buscar informações do criador
    SELECT 
        u.is_verified,
        COALESCE(b.is_verified, false),
        COALESCE(pc.total_sales, 0)
    INTO 
        is_verified,
        is_business_verified,
        total_sales
    FROM users u
    LEFT JOIN businesses b ON u.business_id = b.id
    LEFT JOIN (
        SELECT creator_id, COUNT(*) as total_sales
        FROM content_purchases
        WHERE status = 'completed'
        GROUP BY creator_id
    ) pc ON pc.creator_id = p_creator_id
    WHERE u.id = p_creator_id;
    
    -- Calcular taxa de comissão baseada em vários fatores
    commission_rate := 0.20; -- 20% padrão
    
    -- Desconto por verificação
    IF is_verified AND is_business_verified THEN
        commission_rate := commission_rate - 0.05; -- 15%
    ELSIF is_verified OR is_business_verified THEN
        commission_rate := commission_rate - 0.025; -- 17.5%
    END IF;
    
    -- Desconto por volume de vendas
    IF total_sales >= 1000 THEN
        commission_rate := commission_rate - 0.05; -- Adicional 5% off
    ELSIF total_sales >= 500 THEN
        commission_rate := commission_rate - 0.03; -- Adicional 3% off
    ELSIF total_sales >= 100 THEN
        commission_rate := commission_rate - 0.01; -- Adicional 1% off
    END IF;
    
    -- Mínimo de 10% de comissão
    commission_rate := GREATEST(commission_rate, 0.10);
    
    -- Calcular valores
    platform_fee := ROUND(p_amount * commission_rate, 2);
    creator_revenue := p_amount - platform_fee;
    
    RETURN QUERY SELECT platform_fee, creator_revenue;
END;
$ LANGUAGE plpgsql;

-- Função para processar compra de conteúdo
CREATE OR REPLACE FUNCTION process_content_purchase()
RETURNS TRIGGER AS $
DECLARE
    commission RECORD;
BEGIN
    -- Calcular comissão
    SELECT * INTO commission
    FROM calculate_content_commission(
        (SELECT creator_id FROM paid_content WHERE id = NEW.content_id),
        NEW.amount_paid,
        (SELECT content_type FROM paid_content WHERE id = NEW.content_id)
    );
    
    -- Atualizar valores de comissão
    NEW.platform_fee := commission.platform_fee;
    NEW.creator_revenue := commission.creator_revenue;
    NEW.platform_fee_percentage := ROUND((commission.platform_fee / NEW.amount_paid * 100), 2);
    
    -- Atualizar estatísticas do conteúdo
    UPDATE paid_content
    SET 
        sales_count = sales_count + 1,
        total_revenue = total_revenue + NEW.creator_revenue
    WHERE id = NEW.content_id;
    
    -- Atualizar receita do criador/business
    UPDATE users
    SET stats = jsonb_set(
        stats,
        '{total_earnings}',
        (COALESCE((stats->>'total_earnings')::decimal, 0) + NEW.creator_revenue)::text::jsonb
    )
    WHERE id = (SELECT creator_id FROM paid_content WHERE id = NEW.content_id);
    
    -- Se tem business associado, atualizar também
    UPDATE businesses
    SET total_revenue = total_revenue + NEW.creator_revenue
    WHERE id = (
        SELECT business_id 
        FROM paid_content 
        WHERE id = NEW.content_id 
        AND business_id IS NOT NULL
    );
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_content_purchase
BEFORE INSERT ON content_purchases
FOR EACH ROW EXECUTE FUNCTION process_content_purchase();

-- Função para atualizar métricas de anúncios
CREATE OR REPLACE FUNCTION update_ad_metrics()
RETURNS TRIGGER AS $
DECLARE
    credit_cost INTEGER;
    cost_per_action DECIMAL;
BEGIN
    -- Buscar custo da ação
    IF NEW.interaction_type = 'impression' THEN
        credit_cost := 1; -- 1 crédito por 1000 impressões (será dividido)
        cost_per_action := 0.001; -- Custo real por impressão
    ELSIF NEW.interaction_type = 'click' THEN
        credit_cost := 0; -- Cliques não custam extra
    END IF;
    
    -- Atualizar métricas do anúncio
    UPDATE business_ads
    SET 
        impressions = CASE WHEN NEW.interaction_type = 'impression' THEN impressions + 1 ELSE impressions END,
        clicks = CASE WHEN NEW.interaction_type = 'click' THEN clicks + 1 ELSE clicks END,
        conversions = CASE WHEN NEW.interaction_type = 'conversion' THEN conversions + 1 ELSE conversions END,
        last_served_at = CASE WHEN NEW.interaction_type = 'impression' THEN NOW() ELSE last_served_at END
    WHERE id = NEW.ad_id;
    
    -- Atualizar métricas da campanha
    UPDATE ad_campaigns
    SET 
        metrics = jsonb_set(
            jsonb_set(
                jsonb_set(
                    metrics,
                    '{impressions}',
                    (COALESCE((metrics->>'impressions')::int, 0) + 
                        CASE WHEN NEW.interaction_type = 'impression' THEN 1 ELSE 0 END
                    )::text::jsonb
                ),
                '{clicks}',
                (COALESCE((metrics->>'clicks')::int, 0) + 
                    CASE WHEN NEW.interaction_type = 'click' THEN 1 ELSE 0 END
                )::text::jsonb
            ),
            '{conversions}',
            (COALESCE((metrics->>'conversions')::int, 0) + 
                CASE WHEN NEW.interaction_type = 'conversion' THEN 1 ELSE 0 END
            )::text::jsonb
        )
    WHERE id = NEW.campaign_id;
    
    -- Cobrar créditos a cada 1000 impressões
    IF NEW.interaction_type = 'impression' THEN
        -- Verificar se completou 1000 impressões
        IF (SELECT impressions % 1000 FROM business_ads WHERE id = NEW.ad_id) = 0 THEN
            -- Cobrar créditos
            PERFORM charge_credits_for_ad(NEW.ad_id, 10); -- 10 créditos por 1000 impressões
        END IF;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ad_metrics
AFTER INSERT ON ad_interactions
FOR EACH ROW EXECUTE FUNCTION update_ad_metrics();

-- Função para cobrar créditos
CREATE OR REPLACE FUNCTION charge_credits_for_ad(
    p_ad_id UUID,
    p_credits INTEGER
) RETURNS BOOLEAN AS $
DECLARE
    v_business_id UUID;
    v_campaign_id UUID;
    v_current_balance INTEGER;
BEGIN
    -- Buscar business e campanha
    SELECT b.business_id, b.campaign_id
    INTO v_business_id, v_campaign_id
    FROM business_ads b
    WHERE b.id = p_ad_id;
    
    -- Buscar saldo atual
    SELECT credit_balance INTO v_current_balance
    FROM businesses
    WHERE id = v_business_id;
    
    -- Verificar se tem saldo suficiente
    IF v_current_balance < p_credits THEN
        -- Pausar campanha se não tem créditos
        UPDATE ad_campaigns
        SET status = 'paused'
        WHERE id = v_campaign_id;
        
        RETURN FALSE;
    END IF;
    
    -- Debitar créditos
    UPDATE businesses
    SET 
        credit_balance = credit_balance - p_credits,
        total_credits_spent = total_credits_spent + p_credits
    WHERE id = v_business_id;
    
    -- Registrar transação
    INSERT INTO credit_transactions (
        business_id,
        type,
        amount,
        balance_before,
        balance_after,
        description,
        reference_id,
        reference_type
    ) VALUES (
        v_business_id,
        'spend',
        -p_credits,
        v_current_balance,
        v_current_balance - p_credits,
        'Anúncio: 1000 impressões',
        p_ad_id,
        'ad'
    );
    
    -- Atualizar gastos da campanha
    UPDATE ad_campaigns
    SET spent_credits = spent_credits + p_credits
    WHERE id = v_campaign_id;
    
    UPDATE business_ads
    SET credits_spent = credits_spent + p_credits
    WHERE id = p_ad_id;
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql;

-- Função para gerar Top Picks diários
CREATE OR REPLACE FUNCTION generate_daily_top_picks()
RETURNS void AS $
DECLARE
    user_record RECORD;
    pick_count INTEGER;
BEGIN
    -- Para cada usuário com dating profile ativo
    FOR user_record IN 
        SELECT dp.user_id, dp.preferences, u.premium_type
        FROM dating_profiles dp
        JOIN users u ON dp.user_id = u.id
        WHERE dp.is_active = true
    LOOP
        -- Determinar quantidade de picks baseado no plano
        pick_count := CASE user_record.premium_type
            WHEN 'diamond' THEN 10
            WHEN 'gold' THEN 5
            ELSE 0
        END;
        
        IF pick_count > 0 THEN
            -- Inserir top picks
            INSERT INTO dating_top_picks (user_id, pick_user_id, score, reasons)
            SELECT 
                user_record.user_id,
                u.id,
                calculate_compatibility_score(user_record.user_id, u.id),
                ARRAY['Interesses em comum', 'Proximidade', 'Alta compatibilidade']
            FROM users u
            JOIN dating_profiles dp2 ON u.id = dp2.user_id
            WHERE u.id != user_record.user_id
            AND dp2.is_active = true
            -- Adicionar mais filtros baseados em preferências
            ORDER BY calculate_compatibility_score(user_record.user_id, u.id) DESC
            LIMIT pick_count
            ON CONFLICT (user_id, pick_user_id, created_at::date) DO NOTHING;
        END IF;
    END LOOP;
END;
$ LANGUAGE plpgsql;

-- Função para calcular score de compatibilidade
CREATE OR REPLACE FUNCTION calculate_compatibility_score(
    p_user_id UUID,
    p_target_id UUID
) RETURNS FLOAT AS $
DECLARE
    score FLOAT := 0;
    user_data RECORD;
    target_data RECORD;
    common_interests INTEGER;
    distance_km FLOAT;
BEGIN
    -- Buscar dados dos usuários
    SELECT 
        u.*,
        dp.preferences,
        dp.current_location
    INTO user_data
    FROM users u
    JOIN dating_profiles dp ON u.id = dp.user_id
    WHERE u.id = p_user_id;
    
    SELECT 
        u.*,
        dp.preferences,
        dp.current_location
    INTO target_data
    FROM users u
    JOIN dating_profiles dp ON u.id = dp.user_id
    WHERE u.id = p_target_id;
    
    -- Calcular interesses em comum
    SELECT COUNT(*) INTO common_interests
    FROM unnest(user_data.interests) AS ui
    JOIN unnest(target_data.interests) AS ti ON ui = ti;
    
    score := score + (common_interests * 10);
    
    -- Calcular distância
    IF user_data.current_location IS NOT NULL AND target_data.current_location IS NOT NULL THEN
        distance_km := ST_Distance(
            user_data.current_location::geography,
            target_data.current_location::geography
        ) / 1000;
        
        -- Quanto mais perto, maior o score
        IF distance_km <= 10 THEN
            score := score + 20;
        ELSIF distance_km <= 50 THEN
            score := score + 10;
        ELSIF distance_km <= 100 THEN
            score := score + 5;
        END IF;
    END IF;
    
    -- Adicionar mais fatores de compatibilidade...
    
    RETURN score;
END;
$ LANGUAGE plpgsql;

-- Função para limpar matches expirados
CREATE OR REPLACE FUNCTION cleanup_expired_matches()
RETURNS void AS $
BEGIN
    UPDATE dating_matches
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at < NOW()
    AND last_interaction < NOW() - INTERVAL '30 days';
END;
$ LANGUAGE plpgsql;

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices para businesses
CREATE INDEX idx_businesses_type_status ON businesses(business_type, status) WHERE status = 'active';
CREATE INDEX idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_businesses_location ON businesses USING GIST(coordinates);
CREATE INDEX idx_businesses_verified ON businesses(is_verified, verification_level) WHERE is_verified = true;

-- Índices para dating
CREATE INDEX idx_dating_profiles_active_location ON dating_profiles USING GIST(current_location) WHERE is_active = true;
CREATE INDEX idx_dating_swipes_recent ON dating_swipes(swiper_id, created_at DESC);
CREATE INDEX idx_dating_matches_active ON dating_matches(status, last_interaction) WHERE status = 'active';
CREATE INDEX idx_dating_top_picks_user_date ON dating_top_picks(user_id, created_at::date);

-- Índices para conteúdo pago
CREATE INDEX idx_paid_content_creator_status ON paid_content(creator_id, status) WHERE status = 'active';
CREATE INDEX idx_paid_content_category ON paid_content(category, is_adult);
CREATE INDEX idx_paid_content_price ON paid_content(price) WHERE status = 'active';
CREATE INDEX idx_content_purchases_buyer ON content_purchases(buyer_id, created_at DESC);

-- Índices para anúncios
CREATE INDEX idx_ad_campaigns_active ON ad_campaigns(business_id, status) WHERE status = 'active';
CREATE INDEX idx_ad_campaigns_schedule ON ad_campaigns(start_date, end_date) WHERE status = 'active';
CREATE INDEX idx_business_ads_serving ON business_ads(status, format) WHERE status = 'active';
CREATE INDEX idx_ad_interactions_campaign_type ON ad_interactions(campaign_id, interaction_type, created_at);

-- Índices para admin
CREATE INDEX idx_admin_logs_target ON admin_action_logs(target_type, target_id, created_at DESC);
CREATE INDEX idx_admin_logs_admin ON admin_action_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_metrics_date ON admin_metrics(metric_date, metric_hour);

-- =====================================================
-- POLÍTICAS RLS ADICIONAIS
-- =====================================================

-- RLS para businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active businesses" ON businesses
    FOR SELECT USING (status = 'active');

CREATE POLICY "Business owners can manage their business" ON businesses
    FOR ALL USING (owner_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Business team can view their business" ON businesses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_team 
            WHERE business_id = businesses.id 
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND is_active = true
        )
    );

-- RLS para dating
ALTER TABLE dating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dating profile" ON dating_profiles
    FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view active dating profiles" ON dating_profiles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create own swipes" ON dating_swipes
    FOR INSERT WITH CHECK (swiper_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own swipes" ON dating_swipes
    FOR SELECT USING (swiper_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own matches" ON dating_matches
    FOR SELECT USING (
        user1_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        user2_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- RLS para conteúdo pago
ALTER TABLE paid_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active content" ON paid_content
    FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can manage own content" ON paid_content
    FOR ALL USING (creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own purchases" ON content_purchases
    FOR SELECT USING (buyer_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can purchase content" ON content_purchases
    FOR INSERT WITH CHECK (
        buyer_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM paid_content 
            WHERE id = content_id 
            AND status = 'active'
        )
    );

-- RLS para sistema de créditos
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view own credit transactions" ON credit_transactions
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses 
            WHERE owner_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
    );

-- RLS para anúncios
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business can manage own campaigns" ON ad_campaigns
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses 
            WHERE owner_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
    );

CREATE POLICY "Public can view active ads" ON business_ads
    FOR SELECT USING (status = 'active');

-- RLS para admin (apenas super admins)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access admin tables" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND is_active = true
        )
    );

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir pacotes de créditos padrão
INSERT INTO credit_packages (name, credits, bonus_credits, price, description, display_order) VALUES
('Starter', 100, 0, 50.00, 'Ideal para começar', 1),
('Business', 500, 50, 200.00, 'Melhor custo-benefício', 2),
('Professional', 1000, 150, 350.00, 'Para campanhas maiores', 3),
('Enterprise', 5000, 1000, 1500.00, 'Máximo alcance', 4);

-- Inserir custos de ações
INSERT INTO credit_costs (action_type, category, credit_cost, unit, name, description) VALUES
('timeline_ad', 'advertising', 10, '1000_impressions', 'Anúncio na Timeline', 'Seu anúncio aparece na timeline dos usuários'),
('sidebar_ad', 'advertising', 5, '1000_impressions', 'Anúncio na Sidebar', 'Banner na lateral da página'),
('story_ad', 'advertising', 15, '1000_views', 'Anúncio em Stories', 'Anúncio em tela cheia nos stories'),
('event_boost', 'promotion', 50, 'day', 'Impulsionar Evento', 'Destaque seu evento por 24 horas'),
('profile_boost', 'promotion', 30, 'day', 'Impulsionar Perfil', 'Apareça mais nas buscas por 24 horas'),
('bulk_message', 'communication', 1, 'recipient', 'Mensagem em Massa', 'Envie mensagens para múltiplos usuários'),
('analytics_report', 'analytics', 100, 'report', 'Relatório Detalhado', 'Relatório completo de analytics'),
('verification_fast', 'service', 200, 'request', 'Verificação Expressa', 'Verificação em até 24 horas');

-- =====================================================
-- JOBS AGENDADOS (Configurar no Supabase ou cron externo)
-- =====================================================

-- 1. reset_daily_dating_limits() - Executar diariamente à meia-noite
-- 2. generate_daily_top_picks() - Executar diariamente às 6h
-- 3. cleanup_expired_matches() - Executar diariamente
-- 4. cleanup_expired_stories() - Executar a cada hora
-- 5. calculate_admin_metrics() - Executar a cada hora
-- 6. generate_financial_reports() - Executar mensalmente

-- =====================================================
-- FIM DO SCHEMA DE ADMIN, BUSINESS E OPEN DATES
-- =====================================================