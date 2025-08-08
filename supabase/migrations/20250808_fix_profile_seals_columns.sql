-- =====================================================
-- FIX PROFILE SEALS TABLE - Add missing columns
-- Created: 2025-08-08
-- Description: Add color_hex and rarity columns to profile_seals table
-- =====================================================

-- Add color_hex column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profile_seals' 
    AND column_name = 'color_hex'
  ) THEN
    ALTER TABLE profile_seals 
    ADD COLUMN color_hex VARCHAR(7) DEFAULT '#9333ea';
    
    -- Update existing seals with default colors
    UPDATE profile_seals SET color_hex = 
      CASE 
        WHEN name LIKE '%Ouro%' OR name LIKE '%Gold%' THEN '#FFD700'
        WHEN name LIKE '%Diamante%' OR name LIKE '%Diamond%' THEN '#B9F2FF'
        WHEN name LIKE '%Rosa%' OR name LIKE '%Rose%' THEN '#FF69B4'
        WHEN name LIKE '%Coração%' OR name LIKE '%Heart%' THEN '#FF1493'
        WHEN name LIKE '%Estrela%' OR name LIKE '%Star%' THEN '#FFD700'
        WHEN name LIKE '%Fogo%' OR name LIKE '%Fire%' THEN '#FF4500'
        WHEN name LIKE '%Raio%' OR name LIKE '%Lightning%' THEN '#FFD700'
        WHEN name LIKE '%Coroa%' OR name LIKE '%Crown%' THEN '#FFD700'
        WHEN name LIKE '%Cristal%' OR name LIKE '%Crystal%' THEN '#E0FFFF'
        WHEN name LIKE '%Arco-íris%' OR name LIKE '%Rainbow%' THEN '#FF69B4'
        ELSE '#9333ea'
      END
    WHERE color_hex IS NULL OR color_hex = '#9333ea';
  END IF;
END $$;

-- Add rarity column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profile_seals' 
    AND column_name = 'rarity'
  ) THEN
    ALTER TABLE profile_seals 
    ADD COLUMN rarity VARCHAR(20) DEFAULT 'common'
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'));
    
    -- Update existing seals with rarity based on credit cost
    UPDATE profile_seals SET rarity = 
      CASE 
        WHEN credit_cost >= 100 THEN 'legendary'
        WHEN credit_cost >= 75 THEN 'epic'
        WHEN credit_cost >= 50 THEN 'rare'
        ELSE 'common'
      END
    WHERE rarity IS NULL OR rarity = 'common';
  END IF;
END $$;

-- Add gifter_id column to user_profile_seals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_profile_seals' 
    AND column_name = 'gifter_id'
  ) THEN
    ALTER TABLE user_profile_seals 
    ADD COLUMN gifter_id UUID REFERENCES users(id) ON DELETE SET NULL;
    
    -- Update existing records to use sender_id as gifter_id
    UPDATE user_profile_seals 
    SET gifter_id = sender_id 
    WHERE gifter_id IS NULL AND sender_id IS NOT NULL;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profile_seals_rarity ON profile_seals(rarity);
CREATE INDEX IF NOT EXISTS idx_profile_seals_color ON profile_seals(color_hex);

-- Insert default seals if table is empty
INSERT INTO profile_seals (name, icon_url, description, credit_cost, color_hex, rarity, is_available)
SELECT * FROM (VALUES
  ('Coração de Ouro', '💛', 'Um coração dourado para demonstrar apreço especial', 50, '#FFD700', 'rare', true),
  ('Diamante', '💎', 'Símbolo de prestígio e valor', 100, '#B9F2FF', 'legendary', true),
  ('Rosa', '🌹', 'Uma rosa clássica para demonstrar carinho', 15, '#FF69B4', 'common', true),
  ('Estrela', '⭐', 'Você é uma estrela!', 25, '#FFD700', 'common', true),
  ('Coração', '❤️', 'Amor e carinho', 20, '#FF1493', 'common', true),
  ('Fogo', '🔥', 'Você está pegando fogo!', 35, '#FF4500', 'rare', true),
  ('Raio', '⚡', 'Energia e poder', 40, '#FFD700', 'rare', true),
  ('Coroa', '👑', 'Realeza e elegância', 75, '#FFD700', 'epic', true),
  ('Cristal', '💠', 'Raro e valioso', 60, '#E0FFFF', 'epic', true),
  ('Arco-íris', '🌈', 'Alegria e diversidade', 30, '#FF69B4', 'common', true)
) AS v(name, icon_url, description, credit_cost, color_hex, rarity, is_available)
WHERE NOT EXISTS (SELECT 1 FROM profile_seals LIMIT 1);

-- Grant necessary permissions
GRANT SELECT ON profile_seals TO authenticated;
GRANT SELECT, INSERT ON user_profile_seals TO authenticated;

-- Verify the changes
DO $$
BEGIN
  RAISE NOTICE 'Profile seals table fixed successfully!';
END $$;