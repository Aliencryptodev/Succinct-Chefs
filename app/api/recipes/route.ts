import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function GET() {
  try {
    const db = await getDb()
    const recipes = await db.all(`
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
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `)
    
    return NextResponse.json(recipes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { 
      title, description, ingredients, instructions, 
      cookingTime, servings, difficulty, image, 
      country, category 
    } = data

    const db = await getDb()
    const result = await db.run(
      `INSERT INTO recipes (
        title, description, ingredients, instructions, 
        cookingTime, servings, difficulty, image, 
        country, category, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, JSON.stringify(ingredients), 
        JSON.stringify(instructions), cookingTime, servings, 
        difficulty, image, country, category, user.id
      ]
    )

    // Update user's total votes count (initially 0 for new recipe)
    await db.run(
      'UPDATE users SET totalVotes = totalVotes + 0 WHERE id = ?',
      [user.id]
    )

    return NextResponse.json({ 
      id: result.lastID, 
      message: 'Recipe created successfully' 
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 })
  }
}
