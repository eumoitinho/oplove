-- Fix post interaction triggers for automatic counter updates

-- 1. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON public.post_likes;
DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON public.post_comments;
DROP TRIGGER IF EXISTS update_post_shares_count_trigger ON public.post_shares;
DROP TRIGGER IF EXISTS update_post_saves_count_trigger ON public.post_saves;

-- 2. Drop existing trigger functions
DROP FUNCTION IF EXISTS update_post_likes_count();
DROP FUNCTION IF EXISTS update_post_comments_count();
DROP FUNCTION IF EXISTS update_post_shares_count();
DROP FUNCTION IF EXISTS update_post_saves_count();

-- 3. Create trigger function for likes
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger function for comments
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger function for shares
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET shares_count = COALESCE(shares_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET shares_count = GREATEST(COALESCE(shares_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger function for saves
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET saves_count = COALESCE(saves_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET saves_count = GREATEST(COALESCE(saves_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create the triggers
CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

CREATE TRIGGER update_post_shares_count_trigger
AFTER INSERT OR DELETE ON public.post_shares
FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();

CREATE TRIGGER update_post_saves_count_trigger
AFTER INSERT OR DELETE ON public.post_saves
FOR EACH ROW EXECUTE FUNCTION update_post_saves_count();

-- 8. Update existing post counts to ensure they're accurate
UPDATE public.posts p
SET 
  likes_count = COALESCE((SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id), 0),
  comments_count = COALESCE((SELECT COUNT(*) FROM public.post_comments WHERE post_id = p.id), 0),
  shares_count = COALESCE((SELECT COUNT(*) FROM public.post_shares WHERE post_id = p.id), 0),
  saves_count = COALESCE((SELECT COUNT(*) FROM public.post_saves WHERE post_id = p.id), 0);

-- 9. Create trigger for saved_collections
CREATE OR REPLACE FUNCTION update_collection_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.collection_id IS NOT NULL THEN
      UPDATE public.saved_collections
      SET posts_count = COALESCE(posts_count, 0) + 1
      WHERE id = NEW.collection_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.collection_id IS NOT NULL THEN
      UPDATE public.saved_collections
      SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0)
      WHERE id = OLD.collection_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle collection change
    IF OLD.collection_id IS DISTINCT FROM NEW.collection_id THEN
      IF OLD.collection_id IS NOT NULL THEN
        UPDATE public.saved_collections
        SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0)
        WHERE id = OLD.collection_id;
      END IF;
      IF NEW.collection_id IS NOT NULL THEN
        UPDATE public.saved_collections
        SET posts_count = COALESCE(posts_count, 0) + 1
        WHERE id = NEW.collection_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_collection_posts_count_trigger ON public.post_saves;

CREATE TRIGGER update_collection_posts_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.post_saves
FOR EACH ROW EXECUTE FUNCTION update_collection_posts_count();