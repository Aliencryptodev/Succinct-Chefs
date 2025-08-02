'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChefHat, Users, Trophy } from 'lucide-react'

export function HeroSection() {
  const router = useRouter()

  return (
    <section className="py-20 text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
        Share Your <span className="text-orange-600">Culinary Journey</span>
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Join the Twitter crypto community in sharing delicious recipes. 
        Create, vote, and discover amazing dishes from around the world.
      </p>
      
      <div className="flex gap-4 justify-center mb-16">
        <Button 
          size="lg"
          onClick={() => router.push('/register')}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Get Started
        </Button>
        <Button 
          size="lg"
          variant="outline"
          onClick={() => router.push('/recipes')}
        >
          Browse Recipes
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Create Recipes</h3>
          <p className="text-gray-600">Share your favorite recipes with the community</p>
        </div>
        
        <div className="text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Vote & Discover</h3>
          <p className="text-gray-600">Find and vote on the best recipes from the community</p>
        </div>
        
        <div className="text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Earn Recognition</h3>
          <p className="text-gray-600">Climb the leaderboard and become a top chef</p>
        </div>
      </div>
    </section>
  )
}
