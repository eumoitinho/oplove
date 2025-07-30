-- Create user_verifications table for account verification system
CREATE TABLE user_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Personal information
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE NOT NULL,
  
  -- Document information
  document_type TEXT NOT NULL CHECK (document_type IN ('rg', 'cnh', 'passport')),
  document_number TEXT NOT NULL,
  
  -- File paths in Supabase Storage
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  
  -- FaceScan 3D data (JSON)
  face_scan_data JSONB,
  
  -- Verification status and results
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'manual_review')),
  verification_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- Review information
  reviewed_by UUID REFERENCES users(id),
  reviewer_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX idx_user_verifications_status ON user_verifications(status);
CREATE INDEX idx_user_verifications_submitted_at ON user_verifications(submitted_at);

-- Row Level Security (RLS)
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification records
CREATE POLICY "Users can view own verifications" ON user_verifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own verification records
CREATE POLICY "Users can create own verifications" ON user_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending verifications (for resubmission)
CREATE POLICY "Users can update own pending verifications" ON user_verifications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admin policy (for future admin dashboard)
CREATE POLICY "Admins can manage all verifications" ON user_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_verifications_updated_at
  BEFORE UPDATE ON user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_verifications_updated_at();

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification documents
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can view their own verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );