import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    
    const chefs = await db.all(`
      SELECT 
        u.id,
        u.twitterUsername,
        u.twitterAvatar,
        COUNT(DISTINCT r.id) as recipeCount,
        COALESCE(SUM(r.votes), 0) as totalVotes,
        MAX(r.title) as latestRecipeTitle,
        MAX(r.created_at) as latestRecipeDate
      FROM users u
      LEFT JOIN recipes r ON u.id = r.userId
      GROUP BY u.id
      HAVING recipeCount > 0
      ORDER BY totalVotes DESC, recipeCount DESC
    `)
    
    const formattedChefs = chefs.map((chef: any) => ({
      id: chef.id,
      twitterUsername: chef.twitterUsername,
      twitterAvatar: chef.twitterAvatar,
      recipeCount: chef.recipeCount,
      totalVotes: chef.totalVotes,
      latestRecipe: chef.latestRecipeTitle ? {
        title: chef.latestRecipeTitle,
        created_at: chef.latestRecipeDate
      } : null
    }))
    
    return NextResponse.json(formattedChefs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top chefs' }, { status: 500 })
  }
}
