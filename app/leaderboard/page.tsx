'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Medal, Award, Crown, TrendingUp, ChefHat } from 'lucide-react'

interface Chef {
  id: number
  twitterUsername: string
  twitterAvatar: string
  recipeCount: number
  totalVotes: number
  rank?: number
}

export default function LeaderboardPage() {
  const [chefs, setChefs] = useState<Chef[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all')

  useEffect(() => {
    fetchLeaderboard()
  }, [timeRange])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?range=${timeRange}`)
      const data = await res.json()
      setChefs(data.map((chef: Chef, index: number) => ({ ...chef, rank: index + 1 })))
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />
      case 3:
        return <Award className="w-8 h-8 text-orange-600" />
      default:
        return <span className="text-2xl font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-500'
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/30 dark:to-gray-700/30 border-gray-400'
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-500'
      default:
        return 'bg-white dark:bg-gray-800 hover:shadow-lg'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse">Loading leaderboard... 🏆</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Top chefs in the Succinct community
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            {['all', 'month', 'week'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-lg capitalize transition ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 shadow-md text-purple-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {range === 'all' ? 'All Time' : `This ${range}`}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-4">
          {chefs.map((chef) => (
            <Link
              key={chef.id}
              href={`/profile/${chef.twitterUsername}`}
              className={`block rounded-2xl p-6 transition-all transform hover:scale-[1.02] ${getRankStyle(
                chef.rank!
              )} ${chef.rank! <= 3 ? 'border-2' : 'border border-gray-200 dark:border-gray-700'}`}
            >
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className="flex-shrink-0 w-16 text-center">
                  {getRankIcon(chef.rank!)}
                </div>

                {/* Avatar and Username */}
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={chef.twitterAvatar}
                    alt={chef.twitterUsername}
                    className="w-16 h-16 rounded-full border-2 border-purple-500"
                  />
                  <div>
                    <h3 className="text-xl font-bold">@{chef.twitterUsername}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {chef.recipeCount} {chef.recipeCount === 1 ? 'recipe' : 'recipes'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-2 text-2xl font-bold text-purple-600">
                    <Trophy className="w-6 h-6" />
                    {chef.totalVotes}
                  </div>
                  <p className="text-sm text-gray-500">total votes</p>
                </div>

                {/* Trend (optional) */}
                {chef.rank! <= 10 && (
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-2xl font-bold mb-2">Want to climb the ranks?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Share your best recipes and engage with the community!
          </p>
          <Link
            href="/create-recipe"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            Create Your Recipe
          </Link>
        </div>
      </div>
    </div>
  )
}
