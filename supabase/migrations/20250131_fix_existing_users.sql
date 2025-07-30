-- First, let's check if there are users in public.users without auth_id
UPDATE public.users
SET auth_id = id
WHERE auth_id IS NULL;

-- Update any users where auth_id doesn't match id
UPDATE public.users
SET auth_id = id
WHERE auth_id != id;

-- Ensure all auth.users have a corresponding public.users entry
-- Using a more careful approach to avoid conflicts
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT au.* 
    FROM auth.users au
    LEFT JOIN public.users pu ON pu.id = au.id OR pu.auth_id = au.id
    WHERE pu.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.users (
        id,
        auth_id,
        email,
        username,
        name,
        created_at,
        updated_at
      ) VALUES (
        auth_user.id,
        auth_user.id,
        auth_user.email,
        COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1)),
        COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'name', split_part(auth_user.email, '@', 1)),
        COALESCE(auth_user.created_at, NOW()),
        NOW()
      );
    EXCEPTION
      WHEN unique_violation THEN
        -- If there's a conflict, just update the existing record
        UPDATE public.users
        SET 
          auth_id = auth_user.id,
          email = auth_user.email,
          updated_at = NOW()
        WHERE id = auth_user.id;
    END;
  END LOOP;
END $$;