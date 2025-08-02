#!/bin/bash

echo "📝 Creando archivos principales del proyecto..."

# 1. Crear archivo de autenticación JWT
cat > lib/auth.ts << 'EOF'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function createToken(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  
  return token
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string }
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const token = cookies().get('auth-token')?.value
  if (!token) return null
  
  const payload = await verifyToken(token)
  if (!payload) return null
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      twitterHandle: true,
      profileImage: true,
    }
  })
  
  return user
}

export async function login(twitterHandle: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { twitterHandle }
  })
  
  if (!user) return null
  
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return null
  
  const token = await createToken(user.id)
  
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
  
  return user
}

export async function logout() {
  cookies().delete('auth-token')
}

export async function register(twitterHandle: string, password: string) {
  const exists = await prisma.user.findUnique({
    where: { twitterHandle }
  })
  
  if (exists) {
    throw new Error('User already exists')
  }
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.create({
    data: {
      twitterHandle,
      password: hashedPassword,
      profileImage: `https://avatar.vercel.sh/${twitterHandle}`
    }
  })
  
  const token = await createToken(user.id)
  
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })
  
  return user
}
EOF

# 2. Crear constantes
cat > lib/constants.ts << 'EOF'
export const CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'drink', label: 'Drink' },
] as const

export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const

export const DIET_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten Free' },
] as const

export const COUNTRIES = [
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'MX', label: 'Mexico', flag: '🇲🇽' },
  { value: 'IT', label: 'Italy', flag: '🇮🇹' },
  { value: 'JP', label: 'Japan', flag: '🇯🇵' },
  { value: 'IN', label: 'India', flag: '🇮🇳' },
  { value: 'FR', label: 'France', flag: '🇫🇷' },
  { value: 'ES', label: 'Spain', flag: '🇪🇸' },
  { value: 'TH', label: 'Thailand', flag: '🇹🇭' },
  { value: 'GR', label: 'Greece', flag: '🇬🇷' },
  { value: 'CN', label: 'China', flag: '🇨🇳' },
  { value: 'OTHER', label: 'Other', flag: '🌍' },
] as const

export const PREPARATION_TIMES = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3+ hours' },
] as const

export const SERVINGS = [
  { value: 1, label: '1 serving' },
  { value: 2, label: '2 servings' },
  { value: 4, label: '4 servings' },
  { value: 6, label: '6 servings' },
  { value: 8, label: '8 servings' },
  { value: 10, label: '10+ servings' },
] as const
EOF

# 3. Crear layout principal
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Succinct Recipes - Share Your Culinary Journey',
  description: 'A community-driven recipe sharing platform built for the Twitter crypto community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
EOF

# 4. Crear página principal
cat > app/page.tsx << 'EOF'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedRecipes } from '@/components/home/featured-recipes'
import { TopChefs } from '@/components/home/top-chefs'
import { RecentActivity } from '@/components/home/recent-activity'

export default function HomePage() {
  return (
    <div className="space-y-12">
      <HeroSection />
      <FeaturedRecipes />
      <TopChefs />
      <RecentActivity />
    </div>
  )
}
EOF

# 5. Crear componente Navbar
cat > components/layout/navbar.tsx << 'EOF'
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChefHat } from 'lucide-react'

export function Navbar() {
  const router = useRouter()

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <span className="font-bold text-xl">Succinct Recipes</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/recipes" className="hover:text-orange-600 transition">
              Recipes
            </Link>
            <Link href="/leaderboard" className="hover:text-orange-600 transition">
              Leaderboard
            </Link>
            <Link href="/top-chefs" className="hover:text-orange-600 transition">
              Top Chefs
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/login')}
            >
              Log in
            </Button>
            <Button 
              onClick={() => router.push('/register')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
EOF

echo "✅ Archivos principales creados!"
