'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChefHat, Trophy, Users, Clock, Search } from 'lucide-react'

interface Chef {
  id: number
  twitterUsername: string
  twitterAvatar: string
  recipeCount: number
  totalVotes: number
  latestRecipe?: {
    title: string
    created_at: string
  }
}

export default function TopChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([])
  const [filteredChefs, setFilteredChefs] = useState<Chef[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchTopChefs()
  }, [])

  useEffect(() => {
    const filtered = chefs.filter(chef =>
      chef.twitterUsername.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredChefs(filtered)
  }, [search, chefs])

  const fetchTopChefs = async () => {
    try {
      const res = await fetch('/api/top-chefs')
      const data = await res.json()
      setChefs(data)
      setFilteredChefs(data)
    } catch (error) {
      console.error('Failed to fetch top chefs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse">Loading top chefs... 👨‍🍳</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Top Chefs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Meet the culinary masters of our community
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chefs by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full border dark:border-gray-700 dark:bg-gray-800"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Chefs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChefs.map((chef) => (
            <Link
              key={chef.id}
              href={`/profile/${chef.twitterUsername}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <ChefHat className="absolute bottom-4 right-4 w-12 h-12 text-white/30" />
              </div>

              {/* Profile Content */}
              <div className="p-6 -mt-12 relative">
                <img
                  src={chef.twitterAvatar}
                  alt={chef.twitterUsername}
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 mx-auto mb-4"
                />
                
                <h3 className="text-xl font-bold text-center mb-2">
                  @{chef.twitterUsername}
                </h3>

                <div className="flex justify-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{chef.recipeCount}</div>
                    <div className="text-sm text-gray-500">Recipes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{chef.totalVotes}</div>
                    <div className="text-sm text-gray-500">Votes</div>
                  </div>
                </div>

                {chef.latestRecipe && (
                  <div className="pt-4 border-t dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-1">Latest recipe:</p>
                    <p className="font-medium line-clamp-1">{chef.latestRecipe.title}</p>
                  </div>
                )}

                <button className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  View Profile
                </button>
              </div>
            </Link>
          ))}
        </div>

        {filteredChefs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No chefs found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
