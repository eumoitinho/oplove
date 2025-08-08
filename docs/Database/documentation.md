# Sistema de Database - OpenLove

## Visão Geral

Database PostgreSQL via Supabase com Row Level Security (RLS), migrações versionadas, triggers automáticos, e otimizações de performance para alta escala.

## Arquitetura

### Tecnologias
- **PostgreSQL 15** - Database principal
- **Supabase** - Backend-as-a-Service
- **Row Level Security** - Segurança a nível de linha
- **Real-time subscriptions** - WebSocket automático
- **Auto-generated APIs** - REST/GraphQL automáticos

### Estrutura Geral
```sql
-- Schemas principais
public          -- Tabelas da aplicação
auth            -- Sistema de autenticação (Supabase)
storage         -- Armazenamento de arquivos (Supabase)
realtime        -- WebSocket subscriptions (Supabase)
extensions      -- Extensões PostgreSQL
```

## Tabelas Principais

### 1. Sistema de Usuários
```sql
-- Usuários base (extensão do auth.users do Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  
  -- Mídia
  avatar_url TEXT,
  cover_url TEXT,
  
  -- Status e verificação
  is_verified BOOLEAN DEFAULT false,
  premium_type premium_type DEFAULT 'free',
  is_business BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  
  -- Estatísticas (denormalizadas)
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  likes_received_count INTEGER DEFAULT 0,
  
  -- Configurações básicas
  is_private BOOLEAN DEFAULT false,
  show_last_seen BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfis estendidos
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  birth_date DATE,
  location TEXT,
  website TEXT,
  phone VARCHAR(20),
  interests TEXT[],
  relationship_status TEXT,
  looking_for TEXT[],
  languages TEXT[],
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'BR',
  company_name TEXT,
  business_category TEXT,
  business_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificações de identidade
CREATE TABLE user_verifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE NOT NULL,
  document_type TEXT CHECK (document_type IN ('rg', 'cnh', 'passport')),
  document_number TEXT NOT NULL,
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  face_scan_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'manual_review')),
  verification_score DECIMAL(5,2) DEFAULT 0.00,
  reviewed_by UUID REFERENCES users(id),
  reviewer_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Sistema de Posts e Feed
```sql
-- Posts principais
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  content TEXT,
  media_urls TEXT[],
  media_types TEXT[],
  
  -- Configurações
  visibility post_visibility DEFAULT 'public',
  is_premium BOOLEAN DEFAULT false,
  premium_price INTEGER, -- em centavos
  
  -- Estatísticas
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Curtidas de posts
CREATE TABLE post_likes (
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Comentários
CREATE TABLE post_comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES post_comments(id), -- Para replies
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Compartilhamentos
CREATE TABLE post_shares (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mídia dos posts
CREATE TABLE post_media (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  url TEXT NOT NULL,
  type TEXT NOT NULL, -- 'image', 'video', 'audio'
  size INTEGER,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- Para vídeos/áudios
  thumbnail_url TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Sistema de Stories
```sql
-- Stories principais
CREATE TABLE stories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  media_url TEXT NOT NULL,
  media_type story_media_type NOT NULL,
  caption TEXT,
  
  -- Configurações
  visibility story_visibility DEFAULT 'followers',
  allow_replies BOOLEAN DEFAULT true,
  
  -- Estatísticas
  view_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  -- Expiração
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Visualizações de stories
CREATE TABLE story_views (
  story_id UUID REFERENCES stories(id),
  viewer_id UUID REFERENCES users(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reaction story_reaction_type,
  PRIMARY KEY (story_id, viewer_id)
);

-- Replies para stories
CREATE TABLE story_replies (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  sender_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Limites diários de stories
CREATE TABLE story_daily_limits (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  date DATE DEFAULT CURRENT_DATE,
  stories_posted INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Boosts de stories
CREATE TABLE story_boosts (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  user_id UUID REFERENCES users(id),
  duration INTERVAL NOT NULL,
  credits_spent INTEGER NOT NULL,
  target_settings JSONB,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  impressions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Sistema de Mensagens
```sql
-- Conversas
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  type conversation_type NOT NULL DEFAULT 'private',
  name TEXT, -- Para grupos
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES users(id),
  
  -- Campos adicionados v0.3.2
  initiated_by UUID REFERENCES users(id),
  initiated_by_premium BOOLEAN DEFAULT false,
  group_type VARCHAR(50) CHECK (group_type IN ('user_created', 'event', 'community')),
  
  -- Configurações
  is_active BOOLEAN DEFAULT true,
  
  -- Estatísticas
  message_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participantes das conversas
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  role participant_role DEFAULT 'member',
  is_admin BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  last_read_message_id UUID,
  PRIMARY KEY (conversation_id, user_id)
);

-- Mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES users(id),
  
  -- Conteúdo
  content TEXT,
  message_type message_type DEFAULT 'text',
  media_url TEXT,
  media_type TEXT,
  media_size INTEGER,
  media_duration INTEGER,
  
  -- Reply/Quote
  reply_to UUID REFERENCES messages(id),
  
  -- Status
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Status de leitura das mensagens
CREATE TABLE message_reads (
  message_id UUID REFERENCES messages(id),
  user_id UUID REFERENCES users(id),
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- Controle de mensagens diárias (Gold users)
CREATE TABLE daily_message_counts (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);
```

### 5. Sistema de Pagamentos e Créditos
```sql
-- Assinaturas
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  plan_type subscription_plan_type NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  
  -- Stripe/PIX
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  pix_payment_id TEXT,
  
  -- Período
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de pagamentos
CREATE TABLE payment_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  amount INTEGER NOT NULL, -- em centavos
  currency TEXT DEFAULT 'BRL',
  method payment_method NOT NULL,
  status payment_status NOT NULL,
  
  -- IDs externos
  stripe_payment_intent_id TEXT,
  pix_transaction_id TEXT,
  pix_qr_code TEXT,
  pix_expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sistema de créditos
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transações de créditos
CREATE TABLE user_credit_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type credit_transaction_type NOT NULL,
  amount INTEGER NOT NULL, -- positivo para ganho, negativo para gasto
  description TEXT,
  reference_id UUID, -- story_id, seal_id, etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile seals (catálogo)
CREATE TABLE profile_seals (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  cost INTEGER NOT NULL,
  rarity seal_rarity NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seals enviados/recebidos
CREATE TABLE user_profile_seals (
  id UUID PRIMARY KEY,
  receiver_id UUID REFERENCES users(id),
  sender_id UUID REFERENCES users(id),
  seal_id UUID REFERENCES profile_seals(id),
  story_id UUID REFERENCES stories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);
```

### 6. Sistema de Relacionamentos
```sql
-- Seguir/seguidores
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Bloqueios
CREATE TABLE user_blocks (
  blocker_id UUID REFERENCES users(id),
  blocked_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Relatórios de usuários
CREATE TABLE user_reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES users(id),
  reported_id UUID REFERENCES users(id),
  reason report_reason NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Tipos Customizados (ENUMs)

```sql
-- Tipos de planos
CREATE TYPE premium_type AS ENUM ('free', 'gold', 'diamond', 'couple');

-- Status de assinatura
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');

-- Tipos de pagamento
CREATE TYPE payment_method AS ENUM ('stripe', 'pix');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Posts
CREATE TYPE post_visibility AS ENUM ('public', 'followers', 'premium', 'private');

-- Stories
CREATE TYPE story_media_type AS ENUM ('image', 'video');
CREATE TYPE story_visibility AS ENUM ('everyone', 'followers', 'close_friends');
CREATE TYPE story_reaction_type AS ENUM ('like', 'love', 'fire', 'wow', 'sad', 'angry');

-- Mensagens
CREATE TYPE conversation_type AS ENUM ('private', 'group');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'file', 'voice');
CREATE TYPE participant_role AS ENUM ('admin', 'moderator', 'member');

-- Créditos e seals
CREATE TYPE credit_transaction_type AS ENUM ('purchase', 'spend', 'refund', 'admin_adjustment');
CREATE TYPE seal_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Relatórios
CREATE TYPE report_reason AS ENUM ('spam', 'harassment', 'fake_profile', 'inappropriate_content', 'copyright', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Configurações de privacidade
CREATE TYPE privacy_level AS ENUM ('everyone', 'followers', 'premium', 'nobody');
```

## Row Level Security (RLS)

### Políticas Gerais
```sql
-- Usuários só veem perfis não-privados ou que seguem
CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (
    NOT is_private 
    OR auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id = auth.uid() AND following_id = id
    )
  );

-- Usuários só podem atualizar próprio perfil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Políticas de Posts
```sql
-- Posts públicos visíveis para todos
CREATE POLICY "Anyone can view public posts" ON posts
  FOR SELECT USING (
    visibility = 'public'
    OR (visibility = 'followers' AND (
      user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = auth.uid() AND following_id = user_id
      )
    ))
    OR (visibility = 'premium' AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM subscriptions s
        JOIN users u ON u.id = auth.uid()
        WHERE s.user_id = auth.uid() 
        AND s.status = 'active'
        AND s.plan_type IN ('gold', 'diamond', 'couple')
      )
    ))
  );

-- Usuários podem criar posts
CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar próprios posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);
```

### Políticas de Mensagens
```sql
-- Apenas participantes podem ver mensagens da conversa
CREATE POLICY "Participants can view conversation messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
      AND cp.left_at IS NULL
    )
  );

-- Validação de envio de mensagens (regras de negócio)
CREATE POLICY "Message sending validation" ON messages
  FOR INSERT WITH CHECK (
    -- Deve ser participante da conversa
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
      AND cp.left_at IS NULL
    )
    AND
    -- Validação de plano (implementada via function)
    validate_message_permission(auth.uid(), messages.conversation_id)
  );
```

### Políticas de Stories
```sql
-- Stories visíveis conforme configuração de visibilidade
CREATE POLICY "Stories visibility" ON stories
  FOR SELECT USING (
    visibility = 'everyone'
    OR (visibility = 'followers' AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = auth.uid() AND following_id = user_id
      )
    ))
    OR user_id = auth.uid()
  );

-- Apenas o dono pode criar/deletar stories
CREATE POLICY "Users can manage own stories" ON stories
  FOR ALL USING (auth.uid() = user_id);
```

## Triggers e Functions

### Atualização de Contadores
```sql
-- Function para atualizar contadores de posts
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contador de likes
  IF TG_TABLE_NAME = 'post_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
      UPDATE users SET likes_received_count = likes_received_count + 1 
      WHERE id = (SELECT user_id FROM posts WHERE id = NEW.post_id);
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
      UPDATE users SET likes_received_count = likes_received_count - 1 
      WHERE id = (SELECT user_id FROM posts WHERE id = OLD.post_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para likes
CREATE TRIGGER post_likes_stats_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_stats();
```

### Validação de Limites Diários
```sql
-- Function para validar limite de stories diário
CREATE OR REPLACE FUNCTION check_story_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan premium_type;
  user_verified boolean;
  daily_limit integer;
  current_count integer;
BEGIN
  -- Obter dados do usuário
  SELECT premium_type, is_verified INTO user_plan, user_verified
  FROM users WHERE id = NEW.user_id;
  
  -- Determinar limite baseado no plano
  CASE user_plan
    WHEN 'free' THEN 
      daily_limit := CASE WHEN user_verified THEN 3 ELSE 0 END;
    WHEN 'gold' THEN 
      daily_limit := CASE WHEN user_verified THEN 10 ELSE 5 END;
    ELSE 
      daily_limit := CASE WHEN user_verified THEN -1 ELSE 10 END; -- -1 = ilimitado
  END CASE;
  
  -- Se ilimitado, permitir
  IF daily_limit = -1 THEN
    RETURN NEW;
  END IF;
  
  -- Verificar contagem atual
  SELECT COALESCE(stories_posted, 0) INTO current_count
  FROM story_daily_limits 
  WHERE user_id = NEW.user_id AND date = CURRENT_DATE;
  
  -- Verificar limite
  IF current_count >= daily_limit THEN
    RAISE EXCEPTION 'Daily story limit exceeded. Limit: %, Current: %', daily_limit, current_count;
  END IF;
  
  -- Incrementar contador
  INSERT INTO story_daily_limits (user_id, date, stories_posted)
  VALUES (NEW.user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET stories_posted = story_daily_limits.stories_posted + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para stories
CREATE TRIGGER story_daily_limit_trigger
  BEFORE INSERT ON stories
  FOR EACH ROW EXECUTE FUNCTION check_story_daily_limit();
```

## Índices de Performance

### Índices Essenciais
```sql
-- Usuários
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_premium_type ON users(premium_type);
CREATE INDEX idx_users_is_verified ON users(is_verified);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- Seguir
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_follows_created_at ON follows(created_at);

-- Mensagens
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Stories
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_stories_expires_at ON stories(expires_at);
CREATE INDEX idx_stories_active ON stories(created_at) WHERE expires_at > NOW();

-- Créditos
CREATE INDEX idx_credit_transactions_user_id ON user_credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON user_credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_type ON user_credit_transactions(type);
```

### Índices Compostos
```sql
-- Feed timeline optimizado
CREATE INDEX idx_posts_timeline ON posts(user_id, visibility, created_at DESC)
WHERE deleted_at IS NULL;

-- Messages com leitura
CREATE INDEX idx_messages_unread ON messages(conversation_id, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM message_reads mr 
  WHERE mr.message_id = messages.id 
  AND mr.user_id = messages.sender_id
);

-- Stories ativas com boost
CREATE INDEX idx_stories_boosted ON stories(created_at DESC)
WHERE expires_at > NOW() 
AND EXISTS (
  SELECT 1 FROM story_boosts sb 
  WHERE sb.story_id = stories.id 
  AND sb.ends_at > NOW()
);
```

## Backup e Recovery

### Backup Automático
- **Daily backups** - Todo dia às 03:00 UTC
- **Weekly full backup** - Domingos às 01:00 UTC
- **Retention** - 30 dias de backups diários, 12 semanas de backups semanais
- **Point-in-time recovery** - Até 7 dias atrás

### Disaster Recovery
- **RTO** - 4 horas (Recovery Time Objective)
- **RPO** - 15 minutos (Recovery Point Objective)
- **Multi-region** - Replica em 2 regiões
- **Automated failover** - Via Supabase

## Monitoring e Health Checks

### Métricas de Performance
- **Query performance** - Slow queries > 1s
- **Connection pooling** - Max connections utilizadas
- **Database size** - Crescimento por mês
- **Index usage** - Índices não utilizados

### Health Checks
```sql
-- Verificar conexões ativas
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Verificar queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Verificar tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Otimizações Implementadas

### 1. Desnormalização Controlada
- Contadores em tempo real nas tabelas principais
- Estatísticas agregadas para evitar COUNT() frequentes
- Cache de dados computados

### 2. Partitioning
```sql
-- Particionamento por mês para mensagens (futuro)
CREATE TABLE messages_2025_01 PARTITION OF messages
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### 3. Materialized Views
```sql
-- View materializada para trending posts
CREATE MATERIALIZED VIEW trending_posts AS
SELECT 
  p.*,
  (like_count * 3 + comment_count * 5 + share_count * 10) / 
  EXTRACT(EPOCH FROM (NOW() - created_at)) * 3600 as trending_score
FROM posts p
WHERE created_at > NOW() - INTERVAL '24 hours'
AND visibility = 'public'
ORDER BY trending_score DESC;

-- Refresh automático a cada 5 minutos
```

## Problemas Conhecidos

1. **Sequential scans** em algumas queries complexas
2. **Lock contention** em updates de contadores
3. **Connection pool exhaustion** em picos de tráfego
4. **Slow aggregations** em tabelas com muitos dados
5. **RLS overhead** em queries complexas

## TODOs / Melhorias

- [ ] Implementar read replicas para queries de leitura
- [ ] Otimizar queries com EXPLAIN ANALYZE
- [ ] Adicionar mais partitioning em tabelas grandes
- [ ] Implementar cache de queries frequentes
- [ ] Melhorar índices compostos
- [ ] Adicionar alertas de performance
- [ ] Implementar archiving de dados antigos
- [ ] Otimizar RLS policies
- [ ] Adicionar database observability
- [ ] Implementar connection pooling mais eficiente

## Configurações Importantes

### Supabase Settings
```sql
-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Performance
DB_POOL_SIZE=20
DB_TIMEOUT=30000
QUERY_TIMEOUT=60000

# Backup
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
```

## Última Atualização

**Data**: 2025-08-07  
**Versão**: v0.3.5-alpha  
**Status**: Database com schema atualizado, enum de gênero expandido e performance melhorada