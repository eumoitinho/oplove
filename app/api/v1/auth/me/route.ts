import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  return withAuth(async (user) => {
    // User is guaranteed to be authenticated here
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          avatar_url: user.avatar_url,
          bio: user.bio,
          premium_type: user.premium_type,
          is_verified: user.is_verified,
          created_at: user.created_at,
        }
      }
    }
  })
}