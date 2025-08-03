-- SISTEMA DE NOTIFICAÇÕES - VERSÃO ULTRA SEGURA

-- 1. Primeiro vamos verificar se a tabela posts existe e tem user_id
DO $$
DECLARE
    v_has_user_id BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'posts' 
        AND column_name = 'user_id'
    ) INTO v_has_user_id;
    
    IF NOT v_has_user_id THEN
        RAISE NOTICE 'AVISO: Tabela posts não tem coluna user_id!';
    ELSE
        RAISE NOTICE 'OK: Tabela posts tem coluna user_id';
    END IF;
END $$;

-- 2. Criar tabela de notificações (se não existir)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    from_user_id UUID,
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

-- 3. Adicionar constraints de foreign key apenas se as tabelas existirem
DO $$
BEGIN
    -- FK para users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'notifications_user_id_fkey' 
                      AND table_name = 'notifications') THEN
            ALTER TABLE public.notifications 
            ADD CONSTRAINT notifications_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'notifications_from_user_id_fkey' 
                      AND table_name = 'notifications') THEN
            ALTER TABLE public.notifications 
            ADD CONSTRAINT notifications_from_user_id_fkey 
            FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON public.notifications(entity_id, entity_type);

-- 5. Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
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

-- 7. Função para notificar likes - VERSÃO SEGURA
CREATE OR REPLACE FUNCTION public.notify_on_like() 
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_liker_name TEXT;
    v_post_exists BOOLEAN;
BEGIN
    -- Verificar se NEW tem post_id
    IF NEW.post_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Verificar se o post existe e buscar owner usando query dinâmica
    BEGIN
        EXECUTE 'SELECT user_id FROM public.posts WHERE id = $1' 
        INTO v_post_owner_id 
        USING NEW.post_id;
    EXCEPTION 
        WHEN undefined_column THEN
            RAISE WARNING 'Coluna user_id não existe em posts';
            RETURN NEW;
        WHEN OTHERS THEN
            RAISE WARNING 'Erro ao buscar post: %', SQLERRM;
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
    
    -- Criar notificação
    BEGIN
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
            v_liker_name || ' curtiu seu post',
            NEW.post_id,
            'post',
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar notificação: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para notificar comentários - VERSÃO SEGURA
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
    
    -- Buscar owner do post usando query dinâmica
    BEGIN
        EXECUTE 'SELECT user_id FROM public.posts WHERE id = $1' 
        INTO v_post_owner_id 
        USING NEW.post_id;
    EXCEPTION 
        WHEN undefined_column THEN
            RAISE WARNING 'Coluna user_id não existe em posts';
            RETURN NEW;
        WHEN OTHERS THEN
            RAISE WARNING 'Erro ao buscar post: %', SQLERRM;
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
            v_commenter_name || ' comentou: ' || v_comment_preview,
            NEW.post_id,
            'post',
            jsonb_build_object('comment_id', NEW.id),
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar notificação: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para notificar follows - VERSÃO SEGURA
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
            v_follower_name || ' começou a seguir você',
            NEW.follower_id,
            'follow',
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar notificação: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Criar triggers com verificação
-- Remover triggers antigos
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
GRANT EXECUTE ON FUNCTION public.notify_on_like TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_comment TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_follow TO authenticated;

-- 12. Testar criando uma notificação simples
DO $$
DECLARE
    v_test_user_id UUID;
BEGIN
    -- Pegar qualquer user_id
    SELECT id INTO v_test_user_id FROM public.users LIMIT 1;
    
    IF v_test_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message
        ) VALUES (
            v_test_user_id,
            'message',
            'Sistema Ativado',
            'Notificações configuradas com sucesso!'
        );
        RAISE NOTICE 'Notificação teste criada';
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- 13. Verificação final
SELECT 
    'CONCLUÍDO' as status,
    COUNT(*) as total_notificacoes,
    EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'create_like_notification') as trigger_like_existe,
    EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'create_comment_notification') as trigger_comment_existe,
    EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'create_follow_notification') as trigger_follow_existe
FROM public.notifications;