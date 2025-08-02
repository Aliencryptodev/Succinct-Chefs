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
