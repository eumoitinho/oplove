-- MIGRAÇÃO COMPLETA DO SISTEMA DE NOTIFICAÇÕES
-- Esta migração cria tudo necessário para o sistema de notificações funcionar

-- 1. CRIAR TABELA DE NOTIFICAÇÕES (SE NÃO EXISTIR)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'message', 'post')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    entity_id UUID,
    entity_type VARCHAR(50),
    action_taken BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON public.notifications(entity_id, entity_type);

-- 3. HABILITAR RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- 5. CRIAR FUNÇÃO HELPER PARA CRIAR NOTIFICAÇÕES
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_from_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS public.notifications AS $$
DECLARE
    v_notification public.notifications;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        from_user_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        metadata
    ) VALUES (
        p_user_id,
        p_from_user_id,
        p_type,
        p_title,
        p_message,
        p_entity_id,
        p_entity_type,
        p_metadata
    ) RETURNING * INTO v_notification;
    
    RETURN v_notification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR FUNÇÃO PARA NOTIFICAR LIKES
CREATE OR REPLACE FUNCTION public.notify_on_like() 
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_liker_name TEXT;
    v_post_exists BOOLEAN;
BEGIN
    -- Verificar se o post existe e pegar o dono
    SELECT EXISTS(SELECT 1 FROM public.posts WHERE id = NEW.post_id) INTO v_post_exists;
    
    IF NOT v_post_exists THEN
        RETURN NEW;
    END IF;
    
    -- Pegar o dono do post
    SELECT p.user_id INTO v_post_owner_id 
    FROM public.posts p
    WHERE p.id = NEW.post_id;
    
    -- Se não encontrou o owner, retornar
    IF v_post_owner_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Não notificar se o usuário curtiu o próprio post
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Pegar o nome do usuário que curtiu
    SELECT COALESCE(u.name, u.username, u.email) INTO v_liker_name 
    FROM public.users u
    WHERE u.id = NEW.user_id;
    
    -- Criar notificação
    INSERT INTO public.notifications (
        user_id,
        from_user_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        created_at
    ) VALUES (
        v_post_owner_id,
        NEW.user_id,
        'like',
        'Nova curtida',
        COALESCE(v_liker_name, 'Alguém') || ' curtiu seu post',
        NEW.post_id,
        'post',
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CRIAR FUNÇÃO PARA NOTIFICAR COMENTÁRIOS
CREATE OR REPLACE FUNCTION public.notify_on_comment() 
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_commenter_name TEXT;
    v_comment_preview TEXT;
    v_post_exists BOOLEAN;
BEGIN
    -- Verificar se o post existe
    SELECT EXISTS(SELECT 1 FROM public.posts WHERE id = NEW.post_id) INTO v_post_exists;
    
    IF NOT v_post_exists THEN
        RETURN NEW;
    END IF;
    
    -- Pegar o dono do post
    SELECT p.user_id INTO v_post_owner_id 
    FROM public.posts p
    WHERE p.id = NEW.post_id;
    
    -- Se não encontrou o owner, retornar
    IF v_post_owner_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Não notificar se o usuário comentou no próprio post
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Pegar o nome do usuário que comentou
    SELECT COALESCE(u.name, u.username, u.email) INTO v_commenter_name 
    FROM public.users u
    WHERE u.id = NEW.user_id;
    
    -- Pegar preview do comentário
    v_comment_preview := CASE 
        WHEN LENGTH(NEW.content) > 50 THEN 
            SUBSTRING(NEW.content FROM 1 FOR 50) || '...'
        ELSE 
            NEW.content 
    END;
    
    -- Criar notificação
    INSERT INTO public.notifications (
        user_id,
        from_user_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        metadata,
        created_at
    ) VALUES (
        v_post_owner_id,
        NEW.user_id,
        'comment',
        'Novo comentário',
        COALESCE(v_commenter_name, 'Alguém') || ' comentou: ' || v_comment_preview,
        NEW.post_id,
        'post',
        jsonb_build_object('comment_id', NEW.id),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CRIAR FUNÇÃO PARA NOTIFICAR FOLLOWS
CREATE OR REPLACE FUNCTION public.notify_on_follow() 
RETURNS TRIGGER AS $$
DECLARE
    v_follower_name TEXT;
BEGIN
    -- Pegar o nome do seguidor
    SELECT COALESCE(name, username, email) INTO v_follower_name 
    FROM public.users 
    WHERE id = NEW.follower_id;
    
    -- Criar notificação
    INSERT INTO public.notifications (
        user_id,
        from_user_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        created_at
    ) VALUES (
        NEW.following_id,
        NEW.follower_id,
        'follow',
        'Novo seguidor',
        COALESCE(v_follower_name, 'Alguém') || ' começou a seguir você',
        NEW.follower_id,
        'follow',
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CRIAR FUNÇÃO PARA NOTIFICAR MENSAGENS
CREATE OR REPLACE FUNCTION public.notify_on_message() 
RETURNS TRIGGER AS $$
DECLARE
    v_sender_name TEXT;
    v_conversation_participant UUID;
    v_message_preview TEXT;
BEGIN
    -- Pegar o nome do remetente
    SELECT COALESCE(name, username, email) INTO v_sender_name 
    FROM public.users 
    WHERE id = NEW.sender_id;
    
    -- Pegar o outro participante da conversa
    SELECT user_id INTO v_conversation_participant 
    FROM public.conversation_participants 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id
    LIMIT 1;
    
    -- Pegar preview da mensagem
    v_message_preview := CASE 
        WHEN LENGTH(NEW.content) > 50 THEN 
            SUBSTRING(NEW.content FROM 1 FOR 50) || '...'
        ELSE 
            NEW.content 
    END;
    
    -- Criar notificação se encontrou o participante
    IF v_conversation_participant IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_id,
            from_user_id,
            type,
            title,
            message,
            entity_id,
            entity_type,
            created_at
        ) VALUES (
            v_conversation_participant,
            NEW.sender_id,
            'message',
            'Nova mensagem',
            COALESCE(v_sender_name, 'Alguém') || ': ' || v_message_preview,
            NEW.conversation_id,
            'message',
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. REMOVER TRIGGERS ANTIGOS (SE EXISTIREM)
DROP TRIGGER IF EXISTS create_like_notification ON public.likes;
DROP TRIGGER IF EXISTS create_like_notification ON public.post_likes;
DROP TRIGGER IF EXISTS create_comment_notification ON public.comments;
DROP TRIGGER IF EXISTS create_comment_notification ON public.post_comments;
DROP TRIGGER IF EXISTS create_follow_notification ON public.follows;
DROP TRIGGER IF EXISTS create_message_notification ON public.messages;

-- 11. CRIAR TRIGGERS NOVOS

-- Trigger para likes (verificar qual tabela existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'post_likes') THEN
        CREATE TRIGGER create_like_notification 
        AFTER INSERT ON public.post_likes
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();
        RAISE NOTICE 'Trigger criado em post_likes';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = 'likes') THEN
        CREATE TRIGGER create_like_notification 
        AFTER INSERT ON public.likes
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();
        RAISE NOTICE 'Trigger criado em likes';
    END IF;
END $$;

-- Trigger para comentários (verificar qual tabela existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'comments') THEN
        CREATE TRIGGER create_comment_notification 
        AFTER INSERT ON public.comments
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();
        RAISE NOTICE 'Trigger criado em comments';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = 'post_comments') THEN
        CREATE TRIGGER create_comment_notification 
        AFTER INSERT ON public.post_comments
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();
        RAISE NOTICE 'Trigger criado em post_comments';
    END IF;
END $$;

-- Trigger para follows
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'follows') THEN
        CREATE TRIGGER create_follow_notification 
        AFTER INSERT ON public.follows
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();
        RAISE NOTICE 'Trigger criado em follows';
    END IF;
END $$;

-- Trigger para mensagens
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'messages') THEN
        CREATE TRIGGER create_message_notification 
        AFTER INSERT ON public.messages
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();
        RAISE NOTICE 'Trigger criado em messages';
    END IF;
END $$;

-- 12. CONCEDER PERMISSÕES
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_like TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_comment TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_follow TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_message TO authenticated;

-- 13. CRIAR NOTIFICAÇÃO DE TESTE
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Pegar qualquer usuário para teste
    SELECT id INTO v_user_id FROM public.users LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            created_at
        ) VALUES (
            v_user_id,
            'message',
            'Sistema de Notificações Ativado',
            'O sistema de notificações foi configurado com sucesso!',
            NOW()
        );
        RAISE NOTICE 'Notificação de teste criada para usuário %', v_user_id;
    END IF;
END $$;

-- 14. VERIFICAÇÃO FINAL
SELECT 
    'SISTEMA DE NOTIFICAÇÕES CONFIGURADO COM SUCESSO!' as status,
    COUNT(*) as total_notificacoes,
    COUNT(DISTINCT user_id) as usuarios_com_notificacoes
FROM public.notifications;