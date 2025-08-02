import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Por ahora simulamos un upload - en producción usarías Cloudinary
    // const result = await cloudinary.uploader.upload(...)
    
    // Simulación temporal - en producción esto sería la URL de Cloudinary
    const url = `https://picsum.photos/800/600?random=${Date.now()}`
    
    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
