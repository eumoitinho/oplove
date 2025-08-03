-- Fix comment notifications trigger

-- 1. Verificar qual tabela de comentários tem dados
DO $$
DECLARE
    v_comments_count INTEGER;
    v_post_comments_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_comments_count FROM public.comments;
    SELECT COUNT(*) INTO v_post_comments_count FROM public.post_comments;
    
    RAISE NOTICE 'Comentários em comments: %', v_comments_count;
    RAISE NOTICE 'Comentários em post_comments: %', v_post_comments_count;
END $$;

-- 2. Remover triggers antigos
DROP TRIGGER IF EXISTS create_comment_notification ON public.comments;
DROP TRIGGER IF EXISTS create_comment_notification ON public.post_comments;

-- 3. Criar trigger na tabela correta (comments)
CREATE TRIGGER create_comment_notification 
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- 4. Verificar se trigger foi criado
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgtype as trigger_type
FROM pg_trigger 
WHERE tgname = 'create_comment_notification';

-- 5. Testar inserindo um comentário de teste
DO $$
DECLARE
    v_post_id UUID;
    v_user_id UUID;
    v_other_user_id UUID;
BEGIN
    -- Pegar um post e dois usuários diferentes
    SELECT id, user_id INTO v_post_id, v_user_id FROM public.posts LIMIT 1;
    SELECT id INTO v_other_user_id FROM public.users WHERE id != v_user_id LIMIT 1;
    
    IF v_post_id IS NOT NULL AND v_other_user_id IS NOT NULL THEN
        -- Inserir comentário de teste
        INSERT INTO public.comments (
            post_id,
            user_id,
            content,
            created_at
        ) VALUES (
            v_post_id,
            v_other_user_id,
            'Comentário de teste para verificar notificações',
            NOW()
        );
        
        RAISE NOTICE 'Comentário de teste criado no post % pelo usuário %', v_post_id, v_other_user_id;
    ELSE
        RAISE NOTICE 'Não foi possível criar comentário de teste - faltam dados';
    END IF;
END $$;

-- 6. Verificar se notificação foi criada
SELECT 
    n.*,
    u.email as recipient_email
FROM public.notifications n
JOIN public.users u ON u.id = n.recipient_id
WHERE n.type = 'comment'
ORDER BY n.created_at DESC
LIMIT 5;