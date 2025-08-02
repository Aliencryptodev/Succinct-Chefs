import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    const recipe = await db.get(`
      SELECT 
        r.*,
        u.twitterUsername,
        u.twitterAvatar,
        COUNT(DISTINCT v.id) as votes,
        COUNT(DISTINCT c.id) as comments
      FROM recipes r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN votes v ON r.id = v.recipeId
      LEFT JOIN comments c ON r.id = c.recipeId
      WHERE r.id = ?
      GROUP BY r.id
    `, [id])
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }
    
    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Recipe fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 })
  }
}
