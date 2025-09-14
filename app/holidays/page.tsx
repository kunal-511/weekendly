"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ThemeSelector from "@/components/ ThemeSelector"
import HolidayAwareness from "@/components/HolidayAwareness"
import { useTheme } from "@/contexts/theme-context"
import type { LongWeekend, WeekendSchedule } from "@/types/activity"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import ErrorNotification from "@/components/ErrorNotification"
import { usePersistentState } from "@/hooks/use-persistent-state"

export default function HolidaysPage() {
  const router = useRouter()
  const { currentTheme } = useTheme()
  const [isLongWeekendMode, setIsLongWeekendMode] = useState(false)
  const [availableDays, setAvailableDays] = useState<("friday" | "saturday" | "sunday" | "monday")[]>(["saturday", "sunday"])

  const {
    setWeekendSchedule,
    error: persistenceError,
    clearError: clearPersistenceError,
    recoverData,
  } = usePersistentState(currentTheme.id)

  const handleSelectLongWeekend = (longWeekend: LongWeekend) => {
    setIsLongWeekendMode(true)
    setAvailableDays(longWeekend.days)

    // Initialize schedule for the long weekend
    const newSchedule: Partial<WeekendSchedule> = {}
    longWeekend.days.forEach(day => {
      newSchedule[day] = { morning: [], afternoon: [], evening: [] }
    })
    setWeekendSchedule(prev => ({ ...prev, ...newSchedule }))

    router.push('/?section=activities')
  }

  const handlePlanHoliday = () => {
    router.push('/?section=activities')
  }

  const handleBackToPlanning = () => {
    router.push('/')
  }

  return (
    <ErrorBoundary>
      <main
        className="min-h-screen transition-all duration-500"
        style={{
          background: currentTheme.backgroundPattern,
          backgroundColor: currentTheme.colors.background,
        }}
      >
        <ErrorNotification
          error={persistenceError}
          onDismiss={clearPersistenceError}
          onRetry={recoverData}
          autoHide={persistenceError?.type === 'network'}
        />


        <section className="py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-0">
              <div className="w-full sm:w-auto">
                <ThemeSelector />
              </div>
              
              <button
                onClick={handleBackToPlanning}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                ← Back to Planning
              </button>
            </div>
          </div>
        </section>

        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center">
              <div className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium text-sm sm:text-base shadow-sm">
                🏖️ Holiday Planning
              </div>
            </div>
          </div>
        </div>

        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight" style={{ color: currentTheme.colors.foreground }}>
                🏖️ Holiday Planning
              </h2>
              <p className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4 sm:px-0" style={{ color: currentTheme.colors.mutedForeground }}>
                Discover upcoming long weekends and holidays to plan amazing getaways and extended weekend adventures
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8">
              <HolidayAwareness
                onSelectLongWeekend={handleSelectLongWeekend}
                onPlanHoliday={handlePlanHoliday}
              />
            </div>

          </div>
        </section>
      </main>
    </ErrorBoundary>
  )
}
