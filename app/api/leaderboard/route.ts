import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || 'all'
    
    const db = await getDb()
    
    let dateFilter = ''
    if (range === 'week') {
      dateFilter = "AND r.created_at >= datetime('now', '-7 days')"
    } else if (range === 'month') {
      dateFilter = "AND r.created_at >= datetime('now', '-30 days')"
    }
    
    const chefs = await db.all(`
      SELECT 
        u.id,
        u.twitterUsername,
        u.twitterAvatar,
        COUNT(DISTINCT r.id) as recipeCount,
        COALESCE(SUM(r.votes), 0) as totalVotes
      FROM users u
      LEFT JOIN recipes r ON u.id = r.userId ${dateFilter}
      GROUP BY u.id
      ORDER BY totalVotes DESC, recipeCount DESC
      LIMIT 50
    `)
    
    return NextResponse.json(chefs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
