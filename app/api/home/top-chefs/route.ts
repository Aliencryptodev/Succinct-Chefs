import { NextResponse } from 'next/server'
import { getTopChefs } from '@/lib/db'

export async function GET() {
  try {
    const chefs = await getTopChefs(4)
    return NextResponse.json(chefs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top chefs' }, { status: 500 })
  }
}
