#!/bin/bash

echo "🏠 Creando componentes de la página principal..."

# 1. Hero Section
cat > components/home/hero-section.tsx << 'EOF'
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
EOF

# 2. Featured Recipes (placeholder)
cat > components/home/featured-recipes.tsx << 'EOF'
export function FeaturedRecipes() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">Featured Recipes</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
          <h3 className="font-semibold mb-2">Coming Soon</h3>
          <p className="text-gray-600">Be the first to share a recipe!</p>
        </div>
      </div>
    </section>
  )
}
EOF

# 3. Top Chefs (placeholder)
cat > components/home/top-chefs.tsx << 'EOF'
export function TopChefs() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">Top Chefs</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Top chefs will appear here once recipes are shared!</p>
      </div>
    </section>
  )
}
EOF

# 4. Recent Activity (placeholder)
cat > components/home/recent-activity.tsx << 'EOF'
export function RecentActivity() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">Recent Activity</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Recent activity will appear here!</p>
      </div>
    </section>
  )
}
EOF

echo "✅ Componentes de home creados!"
