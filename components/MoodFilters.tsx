"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { moodOptions } from "@/data/data"

interface MoodFilterProps {
  onMoodChange: (filters: MoodFilters) => void
}

export interface MoodFilters {
  energy: string[]
  social: string[]
  vibes: string[]
}


export default function MoodFilter({ onMoodChange }: MoodFilterProps) {
  const [selectedFilters, setSelectedFilters] = useState<MoodFilters>({
    energy: [],
    social: [],
    vibes: [],
  })

  const toggleFilter = (category: keyof MoodFilters, value: string) => {
    const newFilters = {
      ...selectedFilters,
      [category]: selectedFilters[category].includes(value)
        ? selectedFilters[category].filter((v) => v !== value)
        : [...selectedFilters[category], value],
    }
    setSelectedFilters(newFilters)
    onMoodChange(newFilters)
  }

  const clearAllFilters = () => {
    const emptyFilters = { energy: [], social: [], vibes: [] }
    setSelectedFilters(emptyFilters)
    onMoodChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(selectedFilters).some((arr) => arr.length > 0)

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800 text-sm sm:text-base">Filter by Mood</h4>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-xs text-gray-500 hover:text-gray-700 underline touch-manipulation">
            Clear all
          </button>
        )}
      </div>

      {Object.entries(moodOptions).map(([category, options]) => (
        <div key={category} className="space-y-2">
          <div className="text-xs sm:text-sm font-medium text-gray-700 capitalize">{category}:</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {options.map((option) => {
              const isSelected = selectedFilters[category as keyof MoodFilters].includes(option.id)
              return (
                <button
                  key={option.id}
                  onClick={() => toggleFilter(category as keyof MoodFilters, option.id)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium transition-all duration-200 touch-manipulation",
                    "border hover:scale-105 min-h-[36px] sm:min-h-auto",
                    isSelected
                      ? "bg-blue-100 border-blue-300 text-blue-800"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <span className="text-sm">{option.emoji}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                  <span className="sm:hidden text-xs">{option.id}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
