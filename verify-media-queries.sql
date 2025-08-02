-- 1. Verificar se a mídia foi salva no post
SELECT id, content, media_urls, media_types, created_at 
FROM posts 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Verificar detalhes do seu usuário atual
SELECT id, email, username, premium_type, is_verified 
FROM users 
WHERE id = auth.uid();

-- 3. Queries para mudar de plano:

-- Mudar para FREE
UPDATE users 
SET premium_type = 'free' 
WHERE id = auth.uid();

-- Mudar para GOLD
UPDATE users 
SET premium_type = 'gold' 
WHERE id = auth.uid();

-- Mudar para DIAMOND
UPDATE users 
SET premium_type = 'diamond' 
WHERE id = auth.uid();

-- Mudar para COUPLE
UPDATE users 
SET premium_type = 'couple' 
WHERE id = auth.uid();

-- 4. Verificar status de verificação
UPDATE users 
SET is_verified = true 
WHERE id = auth.uid();

-- 5. Query mais detalhada para debug da mídia
SELECT 
    id,
    content,
    media_urls,
    media_types,
    array_length(media_urls, 1) as total_media,
    created_at
FROM posts 
WHERE user_id = auth.uid() 
AND media_urls IS NOT NULL
ORDER BY created_at DESC;
