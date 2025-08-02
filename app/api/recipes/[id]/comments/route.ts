import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    const comments = await db.all(`
      SELECT 
        c.*,
        u.twitterUsername,
        u.twitterAvatar
      FROM comments c
      LEFT JOIN users u ON c.userId = u.id
      WHERE c.recipeId = ?
      ORDER BY c.created_at DESC
    `, [id])
    
    return NextResponse.json(comments || [])
  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json([])
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { content } = await request.json()
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.run(
      'INSERT INTO comments (recipeId, userId, content) VALUES (?, ?, ?)',
      [id, user.id, content]
    )

    return NextResponse.json({ 
      id: result.lastID,
      message: 'Comment added successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}
