export const CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'drink', label: 'Drink' },
] as const

export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const

export const DIET_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten Free' },
] as const

export const COUNTRIES = [
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'MX', label: 'Mexico', flag: '🇲🇽' },
  { value: 'IT', label: 'Italy', flag: '🇮🇹' },
  { value: 'JP', label: 'Japan', flag: '🇯🇵' },
  { value: 'IN', label: 'India', flag: '🇮🇳' },
  { value: 'FR', label: 'France', flag: '🇫🇷' },
  { value: 'ES', label: 'Spain', flag: '🇪🇸' },
  { value: 'TH', label: 'Thailand', flag: '🇹🇭' },
  { value: 'GR', label: 'Greece', flag: '🇬🇷' },
  { value: 'CN', label: 'China', flag: '🇨🇳' },
  { value: 'OTHER', label: 'Other', flag: '🌍' },
] as const

export const PREPARATION_TIMES = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3+ hours' },
] as const

export const SERVINGS = [
  { value: 1, label: '1 serving' },
  { value: 2, label: '2 servings' },
  { value: 4, label: '4 servings' },
  { value: 6, label: '6 servings' },
  { value: 8, label: '8 servings' },
  { value: 10, label: '10+ servings' },
] as const
