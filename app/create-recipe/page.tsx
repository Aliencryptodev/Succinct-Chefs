'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, X, Loader2, ChefHat, Upload, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const COUNTRIES = [
  'USA', 'UK', 'Spain', 'France', 'Italy', 'Mexico', 
  'Japan', 'China', 'India', 'Brazil', 'Argentina', 'Other'
]

export default function CreateRecipePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cookingTime: 30,
    servings: 4,
    difficulty: 'medium',
    category: 'normal',
    country: 'USA'
  })
  
  const [ingredients, setIngredients] = useState([''])
  const [instructions, setInstructions] = useState([''])

  if (!user) {
    router.push('/login')
    return null
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null
    
    const formData = new FormData()
    formData.append('file', imageFile)
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
        credentials: 'include'
      })
      
      if (!res.ok) throw new Error('Upload failed')
      
      const data = await res.json()
      return data.url
    } catch (error) {
      toast.error('Failed to upload image')
      return null
    }
  }

  const addIngredient = () => setIngredients([...ingredients, ''])
  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }
  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients]
    updated[index] = value
    setIngredients(updated)
  }

  const addInstruction = () => setInstructions([...instructions, ''])
  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }
  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = value
    setInstructions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const filteredIngredients = ingredients.filter(i => i.trim())
    const filteredInstructions = instructions.filter(i => i.trim())
    
    if (filteredIngredients.length === 0 || filteredInstructions.length === 0) {
      toast.error('Please add at least one ingredient and instruction')
      return
    }

    if (!imageFile) {
      toast.error('Please upload a recipe image')
      return
    }

    setLoading(true)
    try {
      // Upload image first
      const imageUrl = await uploadImage()
      if (!imageUrl) {
        throw new Error('Image upload failed')
      }

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          ingredients: filteredIngredients,
          instructions: filteredInstructions
        })
      })

      if (!res.ok) throw new Error('Failed to create recipe')

      const data = await res.json()
      toast.success('Recipe created successfully!')
      router.push(`/recipes/${data.id}`)
    } catch (error) {
      toast.error('Failed to create recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <ChefHat className="w-10 h-10 text-purple-600" />
              Create New Recipe
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Share your culinary masterpiece with the Succinct community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Recipe Image *</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Recipe preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview('')
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-300">
                        Click to upload recipe image
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Max 5MB (JPG, PNG)
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Recipe Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                  placeholder="Succinct Special Pasta"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country of Origin *</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                  required
                >
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                rows={3}
                placeholder="A delicious fusion dish that combines traditional flavors with modern techniques..."
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cooking Time (min) *</label>
                <input
                  type="number"
                  value={formData.cookingTime}
                  onChange={(e) => setFormData({...formData, cookingTime: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Servings *</label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({...formData, servings: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                >
                  <option value="normal">Normal</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten Free</option>
                </select>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium mb-2">Ingredients *</label>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                    placeholder="2 cups of flour"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="mt-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Ingredient
              </button>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium mb-2">Instructions *</label>
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
                    placeholder="Preheat oven to 350°F..."
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addInstruction}
                className="mt-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating Recipe...
                </>
              ) : (
                <>
                  <ChefHat className="w-6 h-6" />
                  Create Recipe
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
