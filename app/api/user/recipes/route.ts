import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const db = await getDb()
    const recipes = await db.all(`
      SELECT 
        r.*,
        COUNT(DISTINCT v.id) as votes,
        COUNT(DISTINCT c.id) as comments
      FROM recipes r
      LEFT JOIN votes v ON r.id = v.recipeId
      LEFT JOIN comments c ON r.id = c.recipeId
      WHERE r.userId = ?
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `, [user.id])
    
    return NextResponse.json(recipes)
  } catch (error) {
    console.error('User recipes error:', error)
    return NextResponse.json({ error: 'Failed to fetch user recipes' }, { status: 500 })
  }
}
