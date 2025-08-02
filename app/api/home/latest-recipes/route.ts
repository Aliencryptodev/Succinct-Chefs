import { NextResponse } from 'next/server'
import { getLatestRecipes } from '@/lib/db'

export async function GET() {
  try {
    const recipes = await getLatestRecipes(4)
    return NextResponse.json(recipes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch latest recipes' }, { status: 500 })
  }
}
