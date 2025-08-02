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
