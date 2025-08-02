import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { findUserById } from '@/lib/db'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    console.log('Auth check - Token exists:', !!token)
    
    if (!token) {
      return NextResponse.json({ user: null })
    }

    const payload = verifyToken(token)
    if (!payload) {
      console.log('Auth check - Invalid token')
      return NextResponse.json({ user: null })
    }

    const user = await findUserById(payload.id)
    if (!user) {
      console.log('Auth check - User not found:', payload.id)
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        twitterUsername: user.twitterUsername,
        twitterAvatar: user.twitterAvatar,
        totalVotes: user.totalVotes
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null })
  }
}
