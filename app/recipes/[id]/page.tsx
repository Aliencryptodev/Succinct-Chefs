'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Clock, Users, ChevronUp, MessageCircle, Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface Recipe {
  id: number
  title: string
  description: string
  ingredients: string
  instructions: string
  cookingTime: number
  servings: number
  difficulty: string
  image: string
  username: string
  votes: number
  created_at: string
}

interface Comment {
  id: number
  content: string
  username: string
  avatar: string
  created_at: string
}

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userVoted, setUserVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)

  useEffect(() => {
    fetchRecipe()
    fetchComments()
    fetchVoteStatus()
  }, [params.id])

  const fetchRecipe = async () => {
    try {
      const res = await fetch(`/api/recipes/${params.id}`)
      if (!res.ok) throw new Error('Recipe not found')
      const data = await res.json()
      setRecipe(data)
    } catch (error) {
      toast.error('Failed to load recipe')
      router.push('/recipes')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/recipes/${params.id}/comments`)
      const data = await res.json()
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments')
    }
  }

  const fetchVoteStatus = async () => {
    try {
      const res = await fetch(`/api/recipes/${params.id}/vote`)
      const data = await res.json()
      setUserVoted(data.userVoted)
      setVoteCount(data.count)
    } catch (error) {
      console.error('Failed to load vote status')
    }
  }

  const handleVote = async () => {
    if (!user) {
      toast.error('Please login to vote')
      return
    }

    try {
      const res = await fetch(`/api/recipes/${params.id}/vote`, {
        method: 'POST'
      })
      const data = await res.json()
      
      setUserVoted(data.voted)
      setVoteCount(prev => prev + (data.voted ? 1 : -1))
      toast.success(data.voted ? 'Vote added!' : 'Vote removed!')
    } catch (error) {
      toast.error('Failed to vote')
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/recipes/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (!res.ok) throw new Error('Failed to add comment')

      toast.success('Comment added!')
      setNewComment('')
      fetchComments() // Refresh comments
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading recipe... 🍳</div>
      </div>
    )
  }

  if (!recipe) return null

  const ingredients = JSON.parse(recipe.ingredients)
  const instructions = JSON.parse(recipe.instructions)

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Recipe Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-96">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{recipe.title}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  by {recipe.username}
                </p>
              </div>
              
              <button
                onClick={handleVote}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition-all ${
                  userVoted
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
              >
                <ChevronUp className="w-6 h-6" />
                {voteCount}
              </button>
            </div>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {recipe.description}
            </p>

            <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {recipe.cookingTime} minutes
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {recipe.servings} servings
              </span>
              <span className={`px-4 py-1 rounded-full font-semibold ${
                recipe.difficulty === 'easy' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' :
                'bg-red-100 text-red-600 dark:bg-red-900/30'
              }`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Ingredients & Instructions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {ingredients.map((ingredient: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Instructions</h2>
            <ol className="space-y-3">
              {instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Send
                </button>
              </div>
            </form>
          ) : (
            <p className="text-center py-4 text-gray-500 mb-6">
              Please login to comment
            </p>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <img
                    src={comment.avatar || '/default-avatar.png'}
                    alt={comment.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.username}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
