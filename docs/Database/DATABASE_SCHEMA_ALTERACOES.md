# 🗄️ Alterações no Schema do Banco de Dados - OpenLove

> **Última atualização:** 07/08/2025  
> **Tabela:** `public.users`  
> **Status:** 📝 Documentando alterações necessárias

## 📊 SCHEMA ATUAL DA TABELA USERS

```sql
create table public.users (
  id uuid not null default gen_random_uuid(),
  auth_id uuid null,
  username character varying(50) not null,
  email character varying(255) not null,
  name character varying(100) null,
  first_name character varying(50) null,        -- ❌ REMOVER (redundante)
  last_name character varying(50) null,         -- ❌ REMOVER (redundante)
  bio text null,
  birth_date date null,
  gender public.gender_type null,               -- 🔄 ALTERAR ENUM
  profile_type public.profile_type null,        -- ❌ REMOVER (será inferido)
  location character varying(255) null,         -- ❌ REMOVER (usar city + uf)
  city character varying(100) null,
  uf character varying(2) null,
  state character varying(100) null,            -- ❌ REMOVER (redundante com uf)
  country character varying(100) null default 'Brazil',
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  avatar_url text null,
  cover_url text null,
  interests text[] null default '{}',
  seeking text[] null default '{}',             -- ❌ REMOVER (não usado)
  looking_for text[] null default '{}',         -- ✅ MANTER (mas corrigir tipo)
  relationship_goals text[] null default '{}',
  is_premium boolean null default false,        -- ❌ REMOVER (usar premium_type)
  premium_type public.premium_type null,        -- 🔄 ALTERAR ENUM
  premium_status public.premium_status null,
  premium_expires_at timestamp with time zone null,
  stripe_customer_id character varying(255) null,
  abacatepay_customer_id character varying(255) null,
  is_verified boolean null default false,
  verified_at timestamp with time zone null,
  is_active boolean null default true,
  status public.user_status null,
  role public.user_role null,
  couple_id uuid null,                          -- ⚠️ DESATIVAR TEMPORARIAMENTE
  is_in_couple boolean null default false,      -- ⚠️ DESATIVAR TEMPORARIAMENTE
  daily_message_limit integer null default 0,
  daily_messages_sent integer null default 0,
  monthly_photo_limit integer null default 3,
  monthly_photos_uploaded integer null default 0,
  monthly_video_limit integer null default 0,
  monthly_videos_uploaded integer null default 0,
  monthly_events_created integer null default 0,
  privacy_settings jsonb null,                  -- ✅ MANTER (já tem default)
  notification_settings jsonb null,             -- ✅ MANTER (já tem default)
  stats jsonb null,                              -- ✅ MANTER (já tem default)
  website character varying(255) null,
  social_links jsonb null default '{}',
  last_active_at timestamp with time zone null,
  created_at timestamp with time zone null,
  updated_at timestamp with time zone null,
  account_type public.account_type null,        -- ⚠️ BUSINESS DESATIVADO
  business_id uuid null,                        -- ⚠️ BUSINESS DESATIVADO
  admin_id uuid null
)
```

## 🔄 ALTERAÇÕES NECESSÁRIAS

### 1️⃣ **ENUM gender_type - ALTERAR**
```sql
-- ATUAL:
CREATE TYPE public.gender_type AS ENUM (
    'male',
    'female', 
    'non_binary',
    'other',
    'prefer_not_say'  -- Diferente do frontend!
);

-- NOVO (baseado em "Eu sou/somos"):
CREATE TYPE public.gender_type_new AS ENUM (
    'couple',           -- Casal
    'couple_female',    -- Casal (2 mulheres)
    'couple_male',      -- Casal (2 homens)
    'male',            -- Homem
    'male_trans',      -- Homem Trans
    'female',          -- Mulher
    'female_trans',    -- Mulher Trans
    'travesti',        -- Travesti
    'crossdressing'    -- Cross-dressing (CD)
);

-- Migração:
ALTER TABLE users ALTER COLUMN gender TYPE gender_type_new USING 
  CASE 
    WHEN gender = 'male' THEN 'male'::gender_type_new
    WHEN gender = 'female' THEN 'female'::gender_type_new
    ELSE 'other'::gender_type_new
  END;
```

### 2️⃣ **ENUM premium_type - ADICIONAR 'couple'**
```sql
-- ATUAL:
CREATE TYPE public.premium_type AS ENUM (
    'free',
    'gold',
    'diamond'
    -- FALTA 'couple'!
);

-- CORREÇÃO:
ALTER TYPE premium_type ADD VALUE 'couple' AFTER 'diamond';

-- ⚠️ NOTA: Como plano couple está desativado, não usar por enquanto
```

### 3️⃣ **Campos para REMOVER**
```sql
ALTER TABLE users 
  DROP COLUMN first_name,      -- Redundante com 'name'
  DROP COLUMN last_name,       -- Redundante com 'name'
  DROP COLUMN location,        -- Usar city + uf
  DROP COLUMN state,           -- Redundante com 'uf'
  DROP COLUMN seeking,         -- Não usado
  DROP COLUMN is_premium,      -- Usar premium_type
  DROP COLUMN profile_type;    -- Será inferido do gender
```

### 4️⃣ **Campo looking_for - CORRIGIR TIPO**
```sql
-- PROBLEMA: Frontend envia string, banco espera array
-- SOLUÇÃO: Manter como array mas garantir que frontend envie array

-- Adicionar as mesmas opções do gender:
UPDATE users SET looking_for = ARRAY[looking_for[1]] WHERE cardinality(looking_for) > 0;
```

### 5️⃣ **Campos BUSINESS - DESATIVAR**
```sql
-- Por enquanto, não fazer nada com:
-- account_type (manter mas só usar 'personal')
-- business_id (manter null)
```

### 6️⃣ **Campos COUPLE - DESATIVAR**
```sql
-- Por enquanto, não fazer nada com:
-- couple_id (manter null)
-- is_in_couple (manter false)
```

## 📋 MIGRATION SQL COMPLETA

```sql
-- 1. Criar novo tipo gender
CREATE TYPE public.gender_type_new AS ENUM (
    'couple',
    'couple_female',
    'couple_male',
    'male',
    'male_trans',
    'female',
    'female_trans',
    'travesti',
    'crossdressing'
);

-- 2. Alterar coluna gender
ALTER TABLE users 
  ALTER COLUMN gender TYPE gender_type_new 
  USING CASE 
    WHEN gender::text = 'male' THEN 'male'::gender_type_new
    WHEN gender::text = 'female' THEN 'female'::gender_type_new
    WHEN gender::text = 'non_binary' THEN 'male'::gender_type_new -- Mapear temporariamente
    WHEN gender::text = 'other' THEN 'male'::gender_type_new      -- Mapear temporariamente
    ELSE 'male'::gender_type_new
  END;

-- 3. Dropar tipo antigo e renomear novo
DROP TYPE gender_type;
ALTER TYPE gender_type_new RENAME TO gender_type;

-- 4. Adicionar 'couple' ao premium_type (mas não usar ainda)
-- ALTER TYPE premium_type ADD VALUE 'couple' AFTER 'diamond';

-- 5. Remover colunas redundantes
ALTER TABLE users 
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS state,
  DROP COLUMN IF EXISTS seeking,
  DROP COLUMN IF EXISTS is_premium,
  DROP COLUMN IF EXISTS profile_type;

-- 6. Atualizar defaults para novos registros
ALTER TABLE users 
  ALTER COLUMN country SET DEFAULT 'Brasil';
```

## ⚠️ IMPACTOS E CONSIDERAÇÕES

### Dados Existentes:
- **gender:** Usuários existentes precisarão atualizar perfil
- **profile_type:** Será inferido automaticamente do gender
- **first_name/last_name:** Dados serão perdidos (já temos 'name')
- **location:** Migrar para formato "Cidade, UF"

### Frontend:
- Atualizar tipos TypeScript
- Remover campos obsoletos dos formulários
- Ajustar queries para não buscar campos removidos

### Backend:
- Atualizar Zod schemas
- Ajustar APIs para novos campos
- Garantir compatibilidade durante migração

## 📊 RESUMO DAS MUDANÇAS

| Campo | Ação | Motivo |
|-------|------|--------|
| `first_name` | ❌ REMOVER | Redundante com `name` |
| `last_name` | ❌ REMOVER | Redundante com `name` |
| `location` | ❌ REMOVER | Usar `city + uf` |
| `state` | ❌ REMOVER | Redundante com `uf` |
| `seeking` | ❌ REMOVER | Não utilizado |
| `is_premium` | ❌ REMOVER | Usar `premium_type` |
| `profile_type` | ❌ REMOVER | Inferir do `gender` |
| `gender` | 🔄 ALTERAR | Novo ENUM com 9 opções |
| `premium_type` | 🔄 ALTERAR | Adicionar 'couple' (desativado) |
| `looking_for` | ✅ MANTER | Corrigir uso no frontend |
| `couple_*` | ⚠️ DESATIVAR | Feature temporariamente desativada |
| `business_*` | ⚠️ DESATIVAR | Feature temporariamente desativada |

---

**IMPORTANTE:** Executar estas alterações em ambiente de teste primeiro!