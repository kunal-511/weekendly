"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Search, X, Filter, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Activity, ActivityCategory } from "@/types/activity"
import type { MoodFilters } from "@/components/MoodFilters"
import { durationRanges, popularityFilters } from "@/data/data"

interface EnhancedSearchProps {
  activities: Activity[]
  categories: ActivityCategory[]
  searchQuery: string
  selectedCategory: string
  moodFilters: MoodFilters
  onSearchChange: (query: string) => void
  onCategoryChange: (categoryId: string) => void
  onMoodChange: (filters: MoodFilters) => void
  onActivitySelect?: (activityId: string) => void
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'activity' | 'category' | 'mood' | 'recent'
  icon: string
  activity?: Activity
}


export default function EnhancedSearch({
  activities,
  categories,
  searchQuery,
  selectedCategory,
  moodFilters,
  onSearchChange,
  onCategoryChange,
  onMoodChange,
  onActivitySelect
}: EnhancedSearchProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<string[]>([])
  const [selectedPopularity, setSelectedPopularity] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('weekendly-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.warn('Failed to load recent searches')
        console.error(e)
      }
    }
  }, [])

  const saveRecentSearch = useCallback((query: string) => {
    if (query.trim().length < 2) return

    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5)
      localStorage.setItem('weekendly-recent-searches', JSON.stringify(updated))
      return updated
    })
  }, [])

  const searchSuggestions = useMemo((): SearchSuggestion[] => {
    if (!isSearchFocused || searchQuery.length === 0) {
      return recentSearches.map(search => ({
        id: `recent-${search}`,
        text: search,
        type: 'recent' as const,
        icon: '🕐'
      }))
    }

    const suggestions: SearchSuggestion[] = []
    const query = searchQuery.toLowerCase()

    activities
      .filter(activity =>
        activity.title.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .forEach(activity => {
        suggestions.push({
          id: `activity-${activity.id}`,
          text: activity.title,
          type: 'activity',
          icon: activity.icon,
          activity
        })
      })

    categories
      .filter(category =>
        category.name.toLowerCase().includes(query) && category.id !== 'all'
      )
      .slice(0, 2)
      .forEach(category => {
        suggestions.push({
          id: `category-${category.id}`,
          text: `Browse ${category.name}`,
          type: 'category',
          icon: category.icon
        })
      })

    return suggestions
  }, [isSearchFocused, searchQuery, activities, categories, recentSearches])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim())
      setIsSearchFocused(false)
      searchInputRef.current?.blur()
    }
  }, [searchQuery, saveRecentSearch])

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'activity' && suggestion.activity) {
      onActivitySelect?.(suggestion.activity.id)
      onSearchChange(suggestion.text)
    } else if (suggestion.type === 'category') {
      const categoryId = suggestion.id.replace('category-', '')
      onCategoryChange(categoryId)
      onSearchChange('')
    } else {
      onSearchChange(suggestion.text)
    }
    saveRecentSearch(suggestion.text)
    setIsSearchFocused(false)
  }, [onActivitySelect, onSearchChange, onCategoryChange, saveRecentSearch])

  const toggleDurationFilter = useCallback((durationId: string) => {
    setSelectedDuration(prev =>
      prev.includes(durationId)
        ? prev.filter(id => id !== durationId)
        : [...prev, durationId]
    )
  }, [])

  const togglePopularityFilter = useCallback((popularityId: string) => {
    setSelectedPopularity(prev =>
      prev.includes(popularityId)
        ? prev.filter(id => id !== popularityId)
        : [...prev, popularityId]
    )
  }, [])

  const clearAllFilters = useCallback(() => {
    onSearchChange('')
    onCategoryChange('all')
    onMoodChange({ energy: [], social: [], vibes: [] })
    setSelectedDuration([])
    setSelectedPopularity([])
  }, [onSearchChange, onCategoryChange, onMoodChange])

  const hasActiveFilters = useMemo(() => {
    return searchQuery.length > 0 ||
      selectedCategory !== 'all' ||
      Object.values(moodFilters).some(arr => arr.length > 0) ||
      selectedDuration.length > 0 ||
      selectedPopularity.length > 0
  }, [searchQuery, selectedCategory, moodFilters, selectedDuration, selectedPopularity])

  const filteredActivitiesCount = useMemo(() => {
    let filtered = activities

    if (selectedCategory !== "all") {
      filtered = filtered.filter((activity) => activity.category.id === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(query) ||
          activity.description.toLowerCase().includes(query) ||
          activity.category.name.toLowerCase().includes(query)
      )
    }

    if (moodFilters.energy.length > 0) {
      filtered = filtered.filter((activity) => moodFilters.energy.includes(activity.mood.energy))
    }
    if (moodFilters.social.length > 0) {
      filtered = filtered.filter((activity) => moodFilters.social.includes(activity.mood.social))
    }
    if (moodFilters.vibes.length > 0) {
      filtered = filtered.filter((activity) => activity.mood.vibes.some((vibe) => moodFilters.vibes.includes(vibe)))
    }

    if (selectedDuration.length > 0) {
      filtered = filtered.filter(activity => {
        return selectedDuration.some(durationId => {
          const range = durationRanges.find(r => r.id === durationId)
          if (!range) return false
          return activity.duration >= range.min && activity.duration <= range.max
        })
      })
    }

    return filtered.length
  }, [activities, selectedCategory, searchQuery, moodFilters, selectedDuration])

  return (
    <div className="space-y-4">
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search activities, categories, or moods..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {isSearchFocused && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
            {searchSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
              >
                <span className="text-lg">{suggestion.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{suggestion.text}</div>
                  {suggestion.type === 'activity' && suggestion.activity && (
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.activity.description}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {suggestion.type === 'recent' ? 'Recent' : suggestion.type}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "flex items-center gap-2",
              showAdvancedFilters && "bg-blue-50 border-blue-300 text-blue-700"
            )}
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
          </Button>

          {hasActiveFilters && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            </>
          )}
        </div>


        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.slice(1, 4).map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className="flex items-center gap-1 whitespace-nowrap"
              >
                <span className="text-sm">{category.icon}</span>
                <span className="hidden sm:inline text-xs">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

      </div>
      {hasActiveFilters && <div className="text-sm text-gray-600">
        {filteredActivitiesCount} activities found
      </div>}

      {showAdvancedFilters && (
        <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-800 text-sm">Duration</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {durationRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => toggleDurationFilter(range.id)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                    selectedDuration.includes(range.id)
                      ? "bg-green-100 border-green-300 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <span>{range.emoji}</span>
                  <span>{range.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-800 text-sm">Popularity</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularityFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => togglePopularityFilter(filter.id)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                    selectedPopularity.includes(filter.id)
                      ? "bg-purple-100 border-purple-300 text-purple-800"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <span>{filter.emoji}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">
                  Active Filters: {filteredActivitiesCount} results
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
