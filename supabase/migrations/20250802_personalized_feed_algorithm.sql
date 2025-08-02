-- Função RPC para gerar feed personalizado com algoritmo de recomendação
CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_user_id UUID,
  p_user_lat FLOAT DEFAULT NULL,
  p_user_lng FLOAT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  likes_count INT,
  comments_count INT,
  shares_count INT,
  media_urls TEXT[],
  media_types TEXT[],
  visibility TEXT,
  score FLOAT,
  -- User data
  username TEXT,
  name TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN,
  premium_type TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
BEGIN
  -- Buscar dados do usuário atual
  SELECT * INTO v_user_record FROM users WHERE users.id = p_user_id;
  
  -- Se usuário não existe, retornar vazio
  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.created_at,
    p.updated_at,
    p.user_id,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.media_urls,
    p.media_types,
    p.visibility,
    -- Cálculo do score baseado nos pesos do algoritmo (ajustado para priorizar assinantes e localização)
    (
      -- Localização (45% do score) - AUMENTADO
      CASE 
        WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL 
             AND u.location IS NOT NULL 
             AND u.location->>'latitude' IS NOT NULL
        THEN 
          -- Score inversamente proporcional à distância (max 50km)
          0.45 * GREATEST(0, 1 - (
            earth_distance(
              ll_to_earth(p_user_lat, p_user_lng),
              ll_to_earth(
                (u.location->>'latitude')::float, 
                (u.location->>'longitude')::float
              )
            ) / 1000 -- converter para km
          ) / 50) -- 50km de raio máximo
        ELSE 0.1 -- Score reduzido se não houver localização
      END +
      
      -- Premium (25% do score) - AUMENTADO SIGNIFICATIVAMENTE
      CASE 
        WHEN u.premium_type = 'couple' THEN 0.25    -- Máxima prioridade para casais
        WHEN u.premium_type = 'diamond' THEN 0.20   -- Alta prioridade Diamond
        WHEN u.premium_type = 'gold' THEN 0.15      -- Prioridade Gold
        ELSE 0                                       -- Sem bonus para free
      END +
      
      -- Verificação (5% do score)
      CASE 
        WHEN u.is_verified = true THEN 0.05
        ELSE 0
      END +
      
      -- Engajamento (25% do score - reduzido)
      -- Baseado em likes e comentários normalizados
      LEAST(0.25, (
        COALESCE(p.likes_count, 0) * 0.005 + -- 1 like = 0.005 pontos
        COALESCE(p.comments_count, 0) * 0.01 -- 1 comentário = 0.01 pontos
      ))
    ) AS score,
    -- Dados do usuário
    u.username,
    u.name,
    u.avatar_url,
    u.is_verified,
    u.premium_type
  FROM posts p
  INNER JOIN users u ON p.user_id = u.id
  WHERE 
    p.visibility = 'public'
    AND p.user_id != p_user_id -- Não mostrar posts do próprio usuário
    AND p.created_at > NOW() - INTERVAL '7 days' -- Posts dos últimos 7 dias
  ORDER BY score DESC, p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Criar índices para otimizar a função
CREATE INDEX IF NOT EXISTS idx_posts_visibility_created ON posts(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIN (location);

-- Garantir que a extensão earthdistance está habilitada
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Adicionar comentário explicativo
COMMENT ON FUNCTION get_personalized_feed IS 'Gera feed personalizado com algoritmo de recomendação baseado em localização (45%), premium (25%), engajamento (25%) e verificação (5%). Prioriza usuários assinantes (Couple > Diamond > Gold) e proximidade geográfica.';