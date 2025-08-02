'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ChefHat, Clock, Users, ChevronUp, Loader2, Twitter } from 'lucide-react'
import Link from 'next/link'

interface UserRecipe {
  id: number
  title: string
  description: string
  cookingTime: number
  servings: number
  difficulty: string
  image: string
  votes: number
  comments: number
  created_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [recipes, setRecipes] = useState<UserRecipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchUserRecipes()
  }, [user])

  const fetchUserRecipes = async () => {
    try {
      const res = await fetch('/api/user/recipes')
      const data = await res.json()
      setRecipes(data)
    } catch (error) {
      console.error('Failed to fetch user recipes')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <img
              src={user.twitterAvatar}
              alt={user.twitterUsername}
              className="w-24 h-24 rounded-full border-4 border-purple-500"
            />
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Twitter className="w-6 h-6 text-blue-500" />
                @{user.twitterUsername}
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Member since {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{recipes.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Recipes</div>
            </div>
            <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {recipes.reduce((sum, r) => sum + r.votes, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Votes</div>
            </div>
            <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {recipes.reduce((sum, r) => sum + r.comments, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Comments</div>
            </div>
          </div>
        </div>

        {/* User's Recipes */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Recipes</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-500 mb-4">You haven't created any recipes yet</p>
              <Link
                href="/create-recipe"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
              >
                Create Your First Recipe
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.cookingTime}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.servings}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <ChevronUp className="w-4 h-4" />
                        {recipe.votes}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
