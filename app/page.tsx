'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChefHat, Clock, Users, ChevronRight, Trophy, Flame, Timer } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Recipe {
  id: number
  title: string
  description: string
  image: string
  votes: number
  cookingTime: number
  servings: number
  category: string
  country: string
  twitterUsername: string
  twitterAvatar: string
}

interface Chef {
  id: number
  twitterUsername: string
  twitterAvatar: string
  recipeCount: number
  totalVotes: number
}

export default function HomePage() {
  const { user } = useAuth()
  const [topRecipes, setTopRecipes] = useState<Recipe[]>([])
  const [latestRecipes, setLatestRecipes] = useState<Recipe[]>([])
  const [topChefs, setTopChefs] = useState<Chef[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      const [topRes, latestRes, chefsRes] = await Promise.all([
        fetch('/api/home/top-recipes'),
        fetch('/api/home/latest-recipes'),
        fetch('/api/home/top-chefs')
      ])

      if (topRes.ok) {
        const top = await topRes.json()
        setTopRecipes(top)
      }
      
      if (latestRes.ok) {
        const latest = await latestRes.json()
        setLatestRecipes(latest)
      }
      
      if (chefsRes.ok) {
        const chefs = await chefsRes.json()
        setTopChefs(chefs)
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vegan': return 'bg-green-500'
      case 'gluten-free': return 'bg-yellow-500'
      default: return 'bg-blue-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse">Loading amazing recipes... 🍳</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            Succinct Recipes 🍳
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Share your culinary masterpieces with the Twitter community
          </p>
          {user ? (
            <Link
              href="/create-recipe"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all"
            >
              Share Your Recipe
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all"
            >
              Join the Community
            </Link>
          )}
        </div>
      </section>

      {/* Top Recipes Section */}
      {topRecipes.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Top Recipes
              </h2>
              <Link
                href="/recipes?sort=top"
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topRecipes.slice(0, 4).map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getCategoryColor(recipe.category)}`}>
                        {recipe.category}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {recipe.country} 🌍
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{recipe.title}</h3>
                    <Link 
                   href={`/profile/${recipe.twitterUsername}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
                   >
                   <img
                   src={recipe.twitterAvatar}
                   alt={recipe.twitterUsername}
                   className="w-6 h-6 rounded-full"
                   />
                   <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors">
                   @{recipe.twitterUsername}
                  </span>
                   </Link>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        {recipe.votes} votes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.cookingTime}m
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Recipes Section */}
      {latestRecipes.length > 0 && (
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Timer className="w-8 h-8 text-blue-500" />
                Latest Recipes
              </h2>
              <Link
                href="/recipes?sort=latest"
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestRecipes.slice(0, 4).map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getCategoryColor(recipe.category)}`}>
                        {recipe.category}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {recipe.country} 🌍
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{recipe.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={recipe.twitterAvatar}
                        alt={recipe.twitterUsername}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        @{recipe.twitterUsername}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings} servings
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.cookingTime}m
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Chefs Section */}
      {topChefs.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Flame className="w-8 h-8 text-orange-500" />
                Top Chefs
              </h2>
              <Link
                href="/leaderboard"
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View Leaderboard <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {topChefs.slice(0, 4).map((chef, index) => (
                <Link
                  key={chef.id}
                  href={`/profile/${chef.twitterUsername}`}
                  className="group text-center"
                >
                  <div className="relative mb-4">
                    <img
                      src={chef.twitterAvatar}
                      alt={chef.twitterUsername}
                      className="w-32 h-32 rounded-full mx-auto border-4 border-purple-500 group-hover:border-purple-600 transition-all"
                    />
                    {index < 3 && (
                      <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">@{chef.twitterUsername}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {chef.recipeCount} recipes
                  </p>
                  <div className="flex items-center justify-center gap-1 text-purple-600">
                    <Trophy className="w-5 h-5" />
                    <span className="font-bold">{chef.totalVotes}</span>
                    <span className="text-sm">votes</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900 to-pink-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Share Your Recipe?</h2>
          <p className="text-xl mb-8">
            Join the Succinct community and showcase your culinary creations
          </p>
          {user ? (
            <Link
              href="/create-recipe"
              className="inline-block px-8 py-4 bg-white text-purple-900 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all"
            >
              Create Your Recipe
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="inline-block px-8 py-4 bg-white text-purple-900 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all"
              >
                Sign Up Now
              </Link>
              <Link
                href="/login"
                className="inline-block px-8 py-4 border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-purple-900 transform hover:scale-105 transition-all"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Welcome Message for No Data */}
      {topRecipes.length === 0 && latestRecipes.length === 0 && topChefs.length === 0 && (
        <section className="py-20 px-4 text-center">
          <ChefHat className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold mb-4">Be the First Chef!</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            No recipes yet. Create the first recipe and become a pioneer in our community!
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700"
          >
            Get Started
          </Link>
        </section>
      )}
    </div>
  )
}
