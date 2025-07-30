-- =====================================================
-- VERIFICAR E ARRUMAR AUTH_ID NA TABELA USERS
-- =====================================================

-- 1. Verificar o problema
SELECT id, auth_id, email, name 
FROM users 
WHERE id = '34d0164c-3ba4-403a-9c15-b896efb27e5f';

-- 2. Atualizar auth_id para o seu usuário
UPDATE users 
SET auth_id = '34d0164c-3ba4-403a-9c15-b896efb27e5f'::uuid
WHERE id = '34d0164c-3ba4-403a-9c15-b896efb27e5f';

-- 3. Verificar se atualizou corretamente
SELECT id, auth_id, email, name 
FROM users 
WHERE id = '34d0164c-3ba4-403a-9c15-b896efb27e5f';

-- 4. Verificar se existem outros usuários com auth_id NULL
SELECT COUNT(*) as users_without_auth_id
FROM users 
WHERE auth_id IS NULL;