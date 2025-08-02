import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/db'
import { createToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import axios from 'axios'

async function getTwitterAvatar(username: string): Promise<string> {
  try {
    // Por ahora usamos un avatar por defecto, pero aquí podrías integrar la API de Twitter
    return `https://unavatar.io/twitter/${username}`
  } catch (error) {
    return '/default-avatar.png'
  }
}

export async function POST(req: NextRequest) {
  try {
    const { twitterUsername, password } = await req.json()

    if (!twitterUsername || !password) {
      return NextResponse.json(
        { error: 'Twitter username and password are required' },
        { status: 400 }
      )
    }

    // Validar formato de username de Twitter
    if (!twitterUsername.match(/^[A-Za-z0-9_]{1,15}$/)) {
      return NextResponse.json(
        { error: 'Invalid Twitter username format' },
        { status: 400 }
      )
    }

    // Obtener avatar de Twitter
    const twitterAvatar = await getTwitterAvatar(twitterUsername)

    const user = await createUser(twitterUsername, password, twitterAvatar)
    const token = createToken({ 
      id: user.id, 
      email: `${twitterUsername}@twitter.local`, 
      username: twitterUsername 
    })
    
    const response = NextResponse.json({ 
      user: { 
        id: user.id, 
        twitterUsername, 
        twitterAvatar 
      },
      message: 'Account created successfully!' 
    })

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    )
  }
}
