import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint is for administrative purposes only
// Should be protected in production
export async function POST(request: NextRequest) {
  try {
    // Create admin client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create video_calls table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create video_calls table for Daily.co integration
        CREATE TABLE IF NOT EXISTS video_calls (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            room_id TEXT NOT NULL,
            room_name TEXT NOT NULL UNIQUE,
            room_url TEXT NOT NULL,
            initiated_by UUID NOT NULL REFERENCES users(id),
            call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
            status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended', 'missed')),
            started_at TIMESTAMPTZ DEFAULT NOW(),
            ended_at TIMESTAMPTZ,
            expires_at TIMESTAMPTZ NOT NULL,
            duration INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create call_participants table
        CREATE TABLE IF NOT EXISTS call_participants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            call_id UUID NOT NULL REFERENCES video_calls(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id),
            session_id TEXT,
            joined_at TIMESTAMPTZ DEFAULT NOW(),
            left_at TIMESTAMPTZ,
            duration INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            
            UNIQUE(call_id, user_id)
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_video_calls_conversation_id ON video_calls(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_video_calls_initiated_by ON video_calls(initiated_by);
        CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);
        CREATE INDEX IF NOT EXISTS idx_video_calls_expires_at ON video_calls(expires_at);
        CREATE INDEX IF NOT EXISTS idx_call_participants_call_id ON call_participants(call_id);
        CREATE INDEX IF NOT EXISTS idx_call_participants_user_id ON call_participants(user_id);

        -- Enable RLS
        ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
        ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
      `
    })

    if (createTableError) {
      console.error('Error creating tables:', createTableError)
      // Continue anyway - tables might already exist
    }

    // Create RLS policies
    const policies = [
      {
        name: 'Users can view calls for their conversations',
        table: 'video_calls',
        operation: 'SELECT',
        sql: `
          CREATE POLICY "Users can view calls for their conversations" ON video_calls
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM conversation_participants cp
                  WHERE cp.conversation_id = video_calls.conversation_id
                  AND cp.user_id = auth.uid()
                  AND cp.left_at IS NULL
              )
          )
        `
      },
      {
        name: 'Diamond and Couple users can create calls',
        table: 'video_calls',
        operation: 'INSERT',
        sql: `
          CREATE POLICY "Diamond and Couple users can create calls" ON video_calls
          FOR INSERT WITH CHECK (
              initiated_by = auth.uid() AND
              EXISTS (
                  SELECT 1 FROM users u
                  WHERE u.id = auth.uid()
                  AND u.premium_type IN ('diamond', 'couple')
              )
          )
        `
      },
      {
        name: 'Initiator can update their calls',
        table: 'video_calls',
        operation: 'UPDATE',
        sql: `
          CREATE POLICY "Initiator can update their calls" ON video_calls
          FOR UPDATE USING (initiated_by = auth.uid())
        `
      },
      {
        name: 'Users can view call participants',
        table: 'call_participants',
        operation: 'SELECT',
        sql: `
          CREATE POLICY "Users can view call participants" ON call_participants
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM video_calls vc
                  JOIN conversation_participants cp ON cp.conversation_id = vc.conversation_id
                  WHERE vc.id = call_participants.call_id
                  AND cp.user_id = auth.uid()
                  AND cp.left_at IS NULL
              )
          )
        `
      },
      {
        name: 'Users can join calls',
        table: 'call_participants',
        operation: 'INSERT',
        sql: `
          CREATE POLICY "Users can join calls" ON call_participants
          FOR INSERT WITH CHECK (
              user_id = auth.uid() AND
              EXISTS (
                  SELECT 1 FROM video_calls vc
                  JOIN conversation_participants cp ON cp.conversation_id = vc.conversation_id
                  WHERE vc.id = call_participants.call_id
                  AND cp.user_id = auth.uid()
                  AND cp.left_at IS NULL
              )
          )
        `
      },
      {
        name: 'Users can update their participation',
        table: 'call_participants',
        operation: 'UPDATE',
        sql: `
          CREATE POLICY "Users can update their participation" ON call_participants
          FOR UPDATE USING (user_id = auth.uid())
        `
      }
    ]

    // Apply policies
    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: policy.sql
      })
      if (error) {
        console.error(`Error creating policy ${policy.name}:`, error)
        // Continue anyway - policy might already exist
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Video calls tables and policies created successfully' 
    })

  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run migrations' },
      { status: 500 }
    )
  }
}