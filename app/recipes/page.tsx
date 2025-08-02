'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Clock, Users, ChevronUp, Filter, Globe, Leaf, Wheat } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface Recipe {
  id: number
  title: string
  description: string
  cookingTime: number
  servings: number
  difficulty: string
  image: string
  country: string
  category: string
  twitterUsername: string
  twitterAvatar: string
  votes: number
  comments: number
  created_at: string
}

const COUNTRIES = [
  'All Countries', 'USA', 'UK', 'Spain', 'France', 'Italy', 'Mexico', 
  'Japan', 'China', 'India', 'Brazil', 'Argentina', 'Other'
]

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [country, setCountry] = useState('All Countries')
  const [difficulty, setDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchRecipes()
  }, [])

  useEffect(() => {
    filterAndSortRecipes()
  }, [recipes, search, category, country, difficulty, sortBy])

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes')
      const data = await res.json()
      setRecipes(data)
      
      if (user) {
        const votePromises = data.map((recipe: Recipe) =>
          fetch(`/api/recipes/${recipe.id}/vote`).then(res => res.json())
        )
        const votes = await Promise.all(votePromises)
        const votedRecipeIds = new Set(
          votes
            .map((vote, index) => vote.userVoted ? data[index].id : null)
            .filter(Boolean)
        )
        setUserVotes(votedRecipeIds)
      }
    } catch (error) {
      toast.error('Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortRecipes = () => {
    let filtered = [...recipes]

    // Search filter
    if (search) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(search.toLowerCase()) ||
        recipe.description.toLowerCase().includes(search.toLowerCase()) ||
        recipe.twitterUsername.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === category)
    }

    // Country filter
    if (country !== 'All Countries') {
      filtered = filtered.filter(recipe => recipe.country === country)
    }

    // Difficulty filter
    if (difficulty !== 'all') {
      filtered = filtered.filter(recipe => recipe.difficulty === difficulty)
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.votes - a.votes)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'quickest':
        filtered.sort((a, b) => a.cookingTime - b.cookingTime)
        break
    }

    setFilteredRecipes(filtered)
  }

  const handleVote = async (recipeId: number, e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to vote')
      return
    }

    try {
      const res = await fetch(`/api/recipes/${recipeId}/vote`, {
        method: 'POST'
      })
      const data = await res.json()

      if (data.voted) {
        setUserVotes(prev => new Set([...prev, recipeId]))
        toast.success('Vote added!')
      } else {
        setUserVotes(prev => {
          const newSet = new Set(prev)
          newSet.delete(recipeId)
          return newSet
        })
        toast.success('Vote removed!')
      }

      setRecipes(prev => prev.map(recipe =>
        recipe.id === recipeId
          ? { ...recipe, votes: recipe.votes + (data.voted ? 1 : -1) }
          : recipe
      ))
    } catch (error) {
      toast.error('Failed to vote')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vegan': return <Leaf className="w-4 h-4" />
      case 'gluten-free': return <Wheat className="w-4 h-4" />
      default: return null
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vegan': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'gluten-free': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse">Loading delicious recipes... 🍳</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Recipe Collection
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover amazing dishes from around the world
          </p>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search recipes or chefs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
            >
              <option value="all">All Categories</option>
              <option value="normal">Normal</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten Free</option>
            </select>

            {/* Country */}
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
            >
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="quickest">Quickest to Make</option>
            </select>
          </div>

          {/* Difficulty Pills */}
          <div className="flex gap-2 mt-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Difficulty:</span>
            {['all', 'easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-1 rounded-full text-sm capitalize transition ${
                  difficulty === diff
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-gray-600 dark:text-gray-300">
          Found {filteredRecipes.length} recipes
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No recipes found with current filters 🛸</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getCategoryColor(recipe.category)}`}>
                      {getCategoryIcon(recipe.category)}
                      {recipe.category}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {recipe.country}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
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
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.cookingTime}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => handleVote(recipe.id, e)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                        userVotes.has(recipe.id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4" />
                      {recipe.votes}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
