-- CORREÇÃO DO SISTEMA DE NOTIFICAÇÕES - USANDO ESTRUTURA EXISTENTE

-- 1. A tabela notifications já existe com estrutura diferente:
-- recipient_id (ao invés de user_id)
-- sender_id (ao invés de from_user_id)
-- Vamos trabalhar com isso!

-- 2. Primeiro, vamos adicionar colunas que estão faltando
DO $$
BEGIN
    -- Adicionar coluna read se não existir (a tabela tem is_read)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'notifications' 
                   AND column_name = 'read') THEN
        -- Não precisa adicionar, já tem is_read
        NULL;
    END IF;
    
    -- Adicionar colunas entity_id e entity_type se não existirem
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
    
    -- Adicionar message (content já existe, mas vamos adicionar message também)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'notifications' 
                   AND column_name = 'message') THEN
        ALTER TABLE public.notifications ADD COLUMN message TEXT;
    END IF;
END $$;

-- 3. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- 4. Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS usando recipient_id
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE
    USING (auth.uid() = recipient_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- 6. Função helper adaptada para estrutura existente
CREATE OR REPLACE FUNCTION public.create_notification(
    p_recipient_id UUID,
    p_sender_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_content TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS public.notifications AS $$
DECLARE
    v_notification public.notifications;
BEGIN
    -- Não criar notificação para o próprio usuário
    IF p_recipient_id = p_sender_id THEN
        RETURN NULL;
    END IF;
    
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
        p_recipient_id,
        p_sender_id,
        p_type,
        p_title,
        p_content,
        p_content, -- duplicar em message também
        p_entity_id,
        p_entity_type,
        p_metadata,
        NOW()
    ) RETURNING * INTO v_notification;
    
    RETURN v_notification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para notificar likes - ADAPTADA
CREATE OR REPLACE FUNCTION public.notify_on_like() 
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_liker_name TEXT;
BEGIN
    -- Verificar se NEW tem post_id
    IF NEW.post_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar owner do post
    BEGIN
        EXECUTE 'SELECT user_id FROM public.posts WHERE id = $1' 
        INTO v_post_owner_id 
        USING NEW.post_id;
    EXCEPTION WHEN OTHERS THEN
        RETURN NEW;
    END;
    
    -- Se não encontrou owner ou é NULL, não notificar
    IF v_post_owner_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Não notificar se o usuário curtiu o próprio post
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Buscar nome do usuário
    BEGIN
        SELECT COALESCE(name, username, email, 'Usuário') INTO v_liker_name 
        FROM public.users 
        WHERE id = NEW.user_id;
    EXCEPTION WHEN OTHERS THEN
        v_liker_name := 'Alguém';
    END;
    
    -- Criar notificação usando estrutura existente
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar notificação: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para notificar comentários - ADAPTADA
CREATE OR REPLACE FUNCTION public.notify_on_comment() 
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_commenter_name TEXT;
    v_comment_preview TEXT;
BEGIN
    -- Verificar se NEW tem post_id
    IF NEW.post_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar owner do post
    BEGIN
        EXECUTE 'SELECT user_id FROM public.posts WHERE id = $1' 
        INTO v_post_owner_id 
        USING NEW.post_id;
    EXCEPTION WHEN OTHERS THEN
        RETURN NEW;
    END;
    
    -- Se não encontrou owner ou é NULL, não notificar
    IF v_post_owner_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Não notificar se o usuário comentou no próprio post
    IF v_post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Buscar nome do usuário
    BEGIN
        SELECT COALESCE(name, username, email, 'Usuário') INTO v_commenter_name 
        FROM public.users 
        WHERE id = NEW.user_id;
    EXCEPTION WHEN OTHERS THEN
        v_commenter_name := 'Alguém';
    END;
    
    -- Preview do comentário
    v_comment_preview := CASE 
        WHEN NEW.content IS NULL THEN ''
        WHEN LENGTH(NEW.content) > 50 THEN 
            SUBSTRING(NEW.content FROM 1 FOR 50) || '...'
        ELSE 
            NEW.content 
    END;
    
    -- Criar notificação
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar notificação: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para notificar follows - ADAPTADA
CREATE OR REPLACE FUNCTION public.notify_on_follow() 
RETURNS TRIGGER AS $$
DECLARE
    v_follower_name TEXT;
BEGIN
    -- Verificar se temos os campos necessários
    IF NEW.follower_id IS NULL OR NEW.following_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar nome do seguidor
    BEGIN
        SELECT COALESCE(name, username, email, 'Usuário') INTO v_follower_name 
        FROM public.users 
        WHERE id = NEW.follower_id;
    EXCEPTION WHEN OTHERS THEN
        v_follower_name := 'Alguém';
    END;
    
    -- Criar notificação
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar notificação: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Criar triggers
DROP TRIGGER IF EXISTS create_like_notification ON public.post_likes;
DROP TRIGGER IF EXISTS create_comment_notification ON public.comments;
DROP TRIGGER IF EXISTS create_follow_notification ON public.follows;

-- Criar triggers apenas se as tabelas existirem
DO $$
BEGIN
    -- Trigger para likes
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'post_likes') THEN
        CREATE TRIGGER create_like_notification 
        AFTER INSERT ON public.post_likes
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();
        RAISE NOTICE 'Trigger de like criado';
    END IF;
    
    -- Trigger para comentários
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'comments') THEN
        CREATE TRIGGER create_comment_notification 
        AFTER INSERT ON public.comments
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();
        RAISE NOTICE 'Trigger de comentário criado';
    END IF;
    
    -- Trigger para follows
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'follows') THEN
        CREATE TRIGGER create_follow_notification 
        AFTER INSERT ON public.follows
        FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();
        RAISE NOTICE 'Trigger de follow criado';
    END IF;
END $$;

-- 11. Conceder permissões
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_like TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_comment TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_follow TO authenticated;

-- 12. Criar notificação de teste
DO $$
DECLARE
    v_test_user_id UUID;
BEGIN
    -- Pegar qualquer user_id
    SELECT id INTO v_test_user_id FROM public.users LIMIT 1;
    
    IF v_test_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            recipient_id,
            type,
            title,
            content,
            message
        ) VALUES (
            v_test_user_id,
            'message',
            'Sistema Ativado',
            'Sistema de notificações configurado!',
            'Sistema de notificações configurado!'
        );
        RAISE NOTICE 'Notificação teste criada';
    END IF;
END $$;

-- 13. Verificação final
SELECT 
    'SISTEMA CONFIGURADO!' as status,
    COUNT(*) as total_notificacoes
FROM public.notifications;