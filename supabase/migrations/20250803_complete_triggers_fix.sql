-- CORREÇÃO COMPLETA DO SISTEMA DE NOTIFICAÇÕES E TRIGGERS

-- 1. Verificar estrutura das tabelas
SELECT 
    'posts' as table_name,
    COUNT(*) as row_count
FROM public.posts
UNION ALL
SELECT 
    'post_likes' as table_name,
    COUNT(*) as row_count
FROM public.post_likes
UNION ALL
SELECT 
    'comments' as table_name,
    COUNT(*) as row_count
FROM public.comments
UNION ALL
SELECT 
    'follows' as table_name,
    COUNT(*) as row_count
FROM public.follows
UNION ALL
SELECT 
    'notifications' as table_name,
    COUNT(*) as row_count
FROM public.notifications;

-- 2. Garantir que a tabela notifications tem as colunas necessárias
DO $$
BEGIN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'notifications' 
                   AND column_name = 'entity_id') THEN
        ALTER TABLE public.notifications ADD COLUMN entity_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'notifications' 
                   AND column_name = 'entity_type') THEN
        ALTER TABLE public.notifications ADD COLUMN entity_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'notifications' 
                   AND column_name = 'message') THEN
        ALTER TABLE public.notifications ADD COLUMN message TEXT;
    END IF;
END $$;

-- 3. Remover TODOS os triggers antigos
DROP TRIGGER IF EXISTS create_like_notification ON public.post_likes CASCADE;
DROP TRIGGER IF EXISTS create_comment_notification ON public.comments CASCADE;
DROP TRIGGER IF EXISTS create_follow_notification ON public.follows CASCADE;
DROP TRIGGER IF EXISTS create_message_notification ON public.messages CASCADE;

-- 4. Recriar funções de notificação corrigidas

-- Função para likes
CREATE OR REPLACE FUNCTION public.notify_on_like() 
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_liker_name TEXT;
BEGIN
    -- Log para debug
    RAISE NOTICE 'notify_on_like triggered for post_id: %, user_id: %', NEW.post_id, NEW.user_id;
    
    -- Buscar o dono do post
    SELECT user_id INTO v_post_owner_id 
    FROM public.posts 
    WHERE id = NEW.post_id;
    
    -- Se não encontrou owner ou é NULL, não notificar
    IF v_post_owner_id IS NULL THEN
        RAISE NOTICE 'Post owner not found or is NULL';
        RETURN NEW;
    END IF;
    
    -- Não notificar se o usuário curtiu o próprio post
    IF v_post_owner_id = NEW.user_id THEN
        RAISE NOTICE 'User liked own post, skipping notification';
        RETURN NEW;
    END IF;
    
    -- Buscar nome do usuário que curtiu
    SELECT COALESCE(name, username, email, 'Usuário') INTO v_liker_name 
    FROM public.users 
    WHERE id = NEW.user_id;
    
    -- Criar notificação
    INSERT INTO public.notifications (
        recipient_id,
        sender_id,
        type,
        title,
        content,
        message,
        entity_id,
        entity_type,
        related_data,
        created_at
    ) VALUES (
        v_post_owner_id,
        NEW.user_id,
        'like',
        'Nova curtida',
        v_liker_name || ' curtiu seu post',
        v_liker_name || ' curtiu seu post',
        NEW.post_id,
        'post',
        jsonb_build_object('post_id', NEW.post_id),
        NOW()
    );
    
    RAISE NOTICE 'Like notification created successfully';
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in notify_on_like: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para comentários
CREATE OR REPLACE FUNCTION public.notify_on_comment() 
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_commenter_name TEXT;
    v_comment_preview TEXT;
BEGIN
    -- Log para debug
    RAISE NOTICE 'notify_on_comment triggered for post_id: %, user_id: %', NEW.post_id, NEW.user_id;
    
    -- Buscar o dono do post
    SELECT user_id INTO v_post_owner_id 
    FROM public.posts 
    WHERE id = NEW.post_id;
    
    -- Se não encontrou owner ou é NULL, não notificar
    IF v_post_owner_id IS NULL THEN
        RAISE NOTICE 'Post owner not found or is NULL';
        RETURN NEW;
    END IF;
    
    -- Não notificar se o usuário comentou no próprio post
    IF v_post_owner_id = NEW.user_id THEN
        RAISE NOTICE 'User commented on own post, skipping notification';
        RETURN NEW;
    END IF;
    
    -- Buscar nome do usuário que comentou
    SELECT COALESCE(name, username, email, 'Usuário') INTO v_commenter_name 
    FROM public.users 
    WHERE id = NEW.user_id;
    
    -- Preview do comentário
    v_comment_preview := CASE 
        WHEN NEW.content IS NULL THEN ''
        WHEN LENGTH(NEW.content) > 50 THEN 
            SUBSTRING(NEW.content FROM 1 FOR 50) || '...'
        ELSE 
            NEW.content 
    END;
    
    -- Criar notificação
    INSERT INTO public.notifications (
        recipient_id,
        sender_id,
        type,
        title,
        content,
        message,
        entity_id,
        entity_type,
        related_data,
        created_at
    ) VALUES (
        v_post_owner_id,
        NEW.user_id,
        'comment',
        'Novo comentário',
        v_commenter_name || ' comentou: ' || v_comment_preview,
        v_commenter_name || ' comentou: ' || v_comment_preview,
        NEW.post_id,
        'post',
        jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id),
        NOW()
    );
    
    RAISE NOTICE 'Comment notification created successfully';
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in notify_on_comment: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para follows
CREATE OR REPLACE FUNCTION public.notify_on_follow() 
RETURNS TRIGGER AS $$
DECLARE
    v_follower_name TEXT;
BEGIN
    -- Log para debug
    RAISE NOTICE 'notify_on_follow triggered for follower_id: %, following_id: %', NEW.follower_id, NEW.following_id;
    
    -- Buscar nome do seguidor
    SELECT COALESCE(name, username, email, 'Usuário') INTO v_follower_name 
    FROM public.users 
    WHERE id = NEW.follower_id;
    
    -- Criar notificação
    INSERT INTO public.notifications (
        recipient_id,
        sender_id,
        type,
        title,
        content,
        message,
        entity_id,
        entity_type,
        related_data,
        created_at
    ) VALUES (
        NEW.following_id,
        NEW.follower_id,
        'follow',
        'Novo seguidor',
        v_follower_name || ' começou a seguir você',
        v_follower_name || ' começou a seguir você',
        NEW.follower_id,
        'follow',
        jsonb_build_object('follower_id', NEW.follower_id),
        NOW()
    );
    
    RAISE NOTICE 'Follow notification created successfully';
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in notify_on_follow: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar triggers
CREATE TRIGGER create_like_notification 
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

CREATE TRIGGER create_comment_notification 
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

CREATE TRIGGER create_follow_notification 
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- 6. Conceder permissões
GRANT EXECUTE ON FUNCTION public.notify_on_like TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_comment TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_follow TO authenticated;

-- 7. Verificar triggers criados
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name
FROM pg_trigger 
JOIN pg_proc ON pg_proc.oid = pg_trigger.tgfoid
WHERE tgname IN ('create_like_notification', 'create_comment_notification', 'create_follow_notification')
ORDER BY tgname;

-- 8. Criar notificação de teste
INSERT INTO public.notifications (
    recipient_id,
    type,
    title,
    content,
    message,
    created_at
) VALUES (
    (SELECT id FROM public.users LIMIT 1),
    'message',
    'Sistema de Notificações Ativo',
    'Triggers de like, comentário e follow foram configurados com sucesso!',
    'Triggers de like, comentário e follow foram configurados com sucesso!',
    NOW()
);

-- 9. Resultado final
SELECT 
    'TRIGGERS CONFIGURADOS!' as status,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') as notificacoes_recentes,
    COUNT(*) as total_notificacoes
FROM public.notifications;