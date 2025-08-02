import { NextRequest, NextResponse } from 'next/server'
import { findUserByTwitterUsername, verifyPassword } from '@/lib/db'
import { createToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { twitterUsername, password } = await req.json()

    if (!twitterUsername || !password) {
      return NextResponse.json(
        { error: 'Twitter username and password are required' },
        { status: 400 }
      )
    }

    const user = await findUserByTwitterUsername(twitterUsername)
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = createToken({ 
      id: user.id, 
      email: `${user.twitterUsername}@twitter.local`, 
      username: user.twitterUsername 
    })
    
    const response = NextResponse.json({ 
      user: { 
        id: user.id, 
        twitterUsername: user.twitterUsername, 
        twitterAvatar: user.twitterAvatar 
      },
      message: 'Login successful' 
    })

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
