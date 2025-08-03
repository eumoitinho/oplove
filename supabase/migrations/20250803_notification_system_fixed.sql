-- SISTEMA DE NOTIFICAÇÕES CORRIGIDO BASEADO NO CLUSTER REAL

-- 1. Verificar e criar tabela de notificações
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        CREATE TABLE public.notifications (
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
        
        -- Criar índices
        CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
        CREATE INDEX idx_notifications_from_user_id ON public.notifications(from_user_id);
        CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
        CREATE INDEX idx_notifications_read ON public.notifications(read);
        CREATE INDEX idx_notifications_type ON public.notifications(type);
        CREATE INDEX idx_notifications_entity ON public.notifications(entity_id, entity_type);
        
        RAISE NOTICE 'Tabela notifications criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela notifications já existe';
    END IF;
END $$;

-- 2. Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
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

-- 4. Função helper para criar notificações
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
    -- Não criar notificação para o próprio usuário
    IF p_user_id = p_from_user_id THEN
        RETURN NULL;
    END IF;
    
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
        p_user_id,
        p_from_user_id,
        p_type,
        p_title,
        p_message,
        p_entity_id,
        p_entity_type,
        p_metadata,
        NOW()
    ) RETURNING * INTO v_notification;
    
    RETURN v_notification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para notificar likes (compatível com post_likes)
CREATE OR REPLACE FUNCTION public.notify_on_like() 
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_liker_name TEXT;
BEGIN
    -- Buscar o dono do post
    SELECT user_id INTO v_post_owner_id 
    FROM public.posts 
    WHERE id = NEW.post_id;
    
    -- Se não encontrou owner ou é NULL, não notificar
    IF v_post_owner_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Não notificar se o usuário curtiu o próprio post
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Buscar nome do usuário que curtiu
    SELECT COALESCE(name, username, email) INTO v_liker_name 
    FROM public.users 
    WHERE id = NEW.user_id;
    
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
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        RAISE WARNING 'Erro ao criar notificação de like: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para notificar comentários
CREATE OR REPLACE FUNCTION public.notify_on_comment() 
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_commenter_name TEXT;
    v_comment_preview TEXT;
BEGIN
    -- Buscar o dono do post
    SELECT user_id INTO v_post_owner_id 
    FROM public.posts 
    WHERE id = NEW.post_id;
    
    -- Se não encontrou owner ou é NULL, não notificar
    IF v_post_owner_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Não notificar se o usuário comentou no próprio post
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Buscar nome do usuário que comentou
    SELECT COALESCE(name, username, email) INTO v_commenter_name 
    FROM public.users 
    WHERE id = NEW.user_id;
    
    -- Preview do comentário
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
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        RAISE WARNING 'Erro ao criar notificação de comentário: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para notificar follows
CREATE OR REPLACE FUNCTION public.notify_on_follow() 
RETURNS TRIGGER AS $$
DECLARE
    v_follower_name TEXT;
BEGIN
    -- Buscar nome do seguidor
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
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        RAISE WARNING 'Erro ao criar notificação de follow: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para notificar mensagens
CREATE OR REPLACE FUNCTION public.notify_on_message() 
RETURNS TRIGGER AS $$
DECLARE
    v_sender_name TEXT;
    v_receiver_id UUID;
    v_message_preview TEXT;
BEGIN
    -- Para mensagens diretas, pegar o outro participante
    SELECT 
        CASE 
            WHEN cp.user_id = NEW.sender_id THEN 
                (SELECT user_id FROM public.conversation_participants 
                 WHERE conversation_id = NEW.conversation_id 
                 AND user_id != NEW.sender_id LIMIT 1)
            ELSE cp.user_id
        END INTO v_receiver_id
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = NEW.conversation_id 
    AND cp.user_id != NEW.sender_id
    LIMIT 1;
    
    -- Se não encontrou destinatário, não notificar
    IF v_receiver_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar nome do remetente
    SELECT COALESCE(name, username, email) INTO v_sender_name 
    FROM public.users 
    WHERE id = NEW.sender_id;
    
    -- Preview da mensagem
    v_message_preview := CASE 
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
        created_at
    ) VALUES (
        v_receiver_id,
        NEW.sender_id,
        'message',
        'Nova mensagem',
        COALESCE(v_sender_name, 'Alguém') || ': ' || v_message_preview,
        NEW.conversation_id,
        'message',
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        RAISE WARNING 'Erro ao criar notificação de mensagem: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Remover triggers antigos
DROP TRIGGER IF EXISTS create_like_notification ON public.post_likes;
DROP TRIGGER IF EXISTS create_comment_notification ON public.comments;
DROP TRIGGER IF EXISTS create_comment_notification ON public.post_comments;
DROP TRIGGER IF EXISTS create_follow_notification ON public.follows;
DROP TRIGGER IF EXISTS create_message_notification ON public.messages;

-- 10. Criar triggers baseados nas tabelas que existem

-- Trigger para post_likes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'post_likes') THEN
        CREATE TRIGGER create_like_notification 
        AFTER INSERT ON public.post_likes
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();
        RAISE NOTICE 'Trigger de like criado em post_likes';
    END IF;
END $$;

-- Trigger para comments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'comments') THEN
        CREATE TRIGGER create_comment_notification 
        AFTER INSERT ON public.comments
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();
        RAISE NOTICE 'Trigger de comentário criado em comments';
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
        RAISE NOTICE 'Trigger de follow criado em follows';
    END IF;
END $$;

-- Trigger para messages
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'messages') THEN
        CREATE TRIGGER create_message_notification 
        AFTER INSERT ON public.messages
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();
        RAISE NOTICE 'Trigger de mensagem criado em messages';
    END IF;
END $$;

-- 11. Conceder permissões
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_like TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_comment TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_follow TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_message TO authenticated;

-- 12. Criar notificação de teste
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Pegar um usuário para teste
    SELECT id INTO v_user_id 
    FROM public.users 
    WHERE id IS NOT NULL
    LIMIT 1;
    
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
            'Sistema Ativado',
            'Sistema de notificações configurado com sucesso!',
            NOW()
        );
        RAISE NOTICE 'Notificação de teste criada para usuário %', v_user_id;
    END IF;
END $$;

-- 13. Verificação final
SELECT 
    'SISTEMA CONFIGURADO!' as status,
    COUNT(*) as total_notificacoes
FROM public.notifications;

-- 14. Limpar arquivo temporário
DO $$
BEGIN
    -- Cleanup
    RAISE NOTICE 'Limpeza completa';
END $$;