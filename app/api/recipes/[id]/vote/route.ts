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
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    const db = await getDb()
    
    // Get total votes
    const totalVotes = await db.get(
      'SELECT COUNT(*) as count FROM votes WHERE recipeId = ?',
      [id]
    )
    
    // Check if user has voted (if logged in)
    let hasVoted = false
    if (token) {
      const user = verifyToken(token)
      if (user) {
        const vote = await db.get(
          'SELECT id FROM votes WHERE recipeId = ? AND userId = ?',
          [id, user.id]
        )
        hasVoted = !!vote
      }
    }
    
    return NextResponse.json({ 
      votes: totalVotes?.count || 0,
      hasVoted 
    })
  } catch (error) {
    console.error('Vote check error:', error)
    return NextResponse.json({ votes: 0, hasVoted: false })
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
      return NextResponse.json({ error: 'Must be logged in to vote' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const db = await getDb()
    
    // Check if already voted
    const existingVote = await db.get(
      'SELECT id FROM votes WHERE recipeId = ? AND userId = ?',
      [id, user.id]
    )
    
    if (existingVote) {
      // Remove vote
      await db.run(
        'DELETE FROM votes WHERE recipeId = ? AND userId = ?',
        [id, user.id]
      )
      
      // Update chef's total votes
      await db.run(`
        UPDATE users 
        SET totalVotes = (
          SELECT COUNT(*) FROM votes v
          JOIN recipes r ON v.recipeId = r.id
          WHERE r.userId = users.id
        )
        WHERE id = (SELECT userId FROM recipes WHERE id = ?)
      `, [id])
      
      return NextResponse.json({ voted: false, message: 'Vote removed' })
    } else {
      // Add vote
      await db.run(
        'INSERT INTO votes (recipeId, userId) VALUES (?, ?)',
        [id, user.id]
      )
      
      // Update chef's total votes
      await db.run(`
        UPDATE users 
        SET totalVotes = (
          SELECT COUNT(*) FROM votes v
          JOIN recipes r ON v.recipeId = r.id
          WHERE r.userId = users.id
        )
        WHERE id = (SELECT userId FROM recipes WHERE id = ?)
      `, [id])
      
      return NextResponse.json({ voted: true, message: 'Vote added' })
    }
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 })
  }
}
