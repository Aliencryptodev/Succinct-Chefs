import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'alien-crypto-secret-key-2025'

export interface UserPayload {
  id: number
  email: string
  username: string
}

export function createToken(user: UserPayload) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function getUser(req: NextRequest): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) return null
    return verifyToken(token)
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}
