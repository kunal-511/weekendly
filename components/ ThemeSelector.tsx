"use client"

import { useTheme } from "@/contexts/theme-context"
import { themes } from "@/data/themes"
import { cn } from "@/lib/utils"

export default function ThemeSelector() {
  const { currentTheme, setTheme, isTransitioning } = useTheme()

  const getMoodEmojis = (themeId: string) => {
    switch (themeId) {
      case "chill":
        return ["😌", "🧘", "☕"]
      case "adventure":
        return ["⚡", "🚀", "🎯"]
      case "social":
        return ["🎉", "💕", "😄"]
      default:
        return []
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-lg">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">Choose Your Weekend Vibe</h3>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        {themes.map((theme) => {
          const isActive = currentTheme.id === theme.id
          const moodEmojis = getMoodEmojis(theme.id)

          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              disabled={isTransitioning}
              className={cn(
                "relative flex flex-row sm:flex-col items-center p-3 sm:p-4 rounded-xl transition-all duration-300 w-full sm:min-w-[120px]",
                "hover:scale-105 hover:shadow-md",
                isActive ? "bg-white shadow-lg ring-2 ring-offset-2" : "bg-gray-50 hover:bg-white",
                isTransitioning && "opacity-50 cursor-not-allowed",
              )}
            >
              <div className="text-xl sm:text-2xl mb-0 sm:mb-2 mr-3 sm:mr-0">{moodEmojis[0]}</div>

              <div className="flex-1 sm:flex-none text-left sm:text-center">
                <div className="text-sm font-medium text-gray-800 mb-1">{theme.name.split(" ")[0]}</div>

                <div className="text-xs text-gray-600 mb-1 sm:mb-2 hidden sm:block">&quot;{theme.description}&quot;</div>
                  <div className="text-xs text-gray-600 mb-1 sm:mb-2 hidden sm:block">&quot;{theme.description}&quot;</div>

                <div className="flex gap-1 justify-start sm:justify-center">
                  {moodEmojis.map((emoji, index) => (
                    <span key={index} className="text-xs">
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "absolute inset-0 rounded-xl opacity-10 transition-opacity duration-300",
                  isActive ? "opacity-20" : "opacity-0",
                )}
                style={{ background: theme.colors.primary }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
