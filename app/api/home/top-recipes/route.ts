import { NextResponse } from 'next/server'
import { getTopRecipes } from '@/lib/db'

export async function GET() {
  try {
    const recipes = await getTopRecipes(4)
    return NextResponse.json(recipes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top recipes' }, { status: 500 })
  }
}
