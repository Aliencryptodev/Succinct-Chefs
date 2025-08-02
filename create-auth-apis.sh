#!/bin/bash

echo "🔑 Creando APIs de autenticación..."

# 1. API Login
cat > app/api/auth/login/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { twitterHandle, password } = await request.json()
    
    if (!twitterHandle || !password) {
      return NextResponse.json(
        { error: 'Twitter handle and password are required' },
        { status: 400 }
      )
    }
    
    const user = await login(twitterHandle, password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        twitterHandle: user.twitterHandle,
        profileImage: user.profileImage
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
EOF

# 2. API Register
cat > app/api/auth/register/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { twitterHandle, password } = await request.json()
    
    if (!twitterHandle || !password) {
      return NextResponse.json(
        { error: 'Twitter handle and password are required' },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }
    
    const user = await register(twitterHandle, password)
    
    return NextResponse.json({
      user: {
        id: user.id,
        twitterHandle: user.twitterHandle,
        profileImage: user.profileImage
      }
    })
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'This Twitter handle is already registered' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
EOF

# 3. API Logout
cat > app/api/auth/logout/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { logout } from '@/lib/auth'

export async function POST() {
  logout()
  return NextResponse.json({ success: true })
}
EOF

echo "✅ APIs de autenticación creadas!"
