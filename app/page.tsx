"use client"

import { useState, useMemo } from "react"
import  HeroSection  from "@/components/HeroSection"
import  ActivityGrid  from "@/components/ActivityGrid"
import  ScheduleNavigation  from "@/components/ScheduleNavigation"
import  WeekendSchedule  from "@/components/WeekendSchedule"
import  TimeSlotModal  from "@/components/TimeSlotModal"
import  EnhancedSearch  from "@/components/EnhancedSearch"
import  TimeClashModal  from "@/components/TimeClashModal"
import  ActivityDetailsModal  from "@/components/ActivityDetailsModal"
import  ThemeSelector  from "@/components/ ThemeSelector"
import  MoodFilter  from "@/components/MoodFilters"
import { DragDropProvider } from "@/contexts/drag-drop-context"
import { useTheme } from "@/contexts/theme-context"
import { activities, categories } from "@/data/actvity"
import type { Activity, ScheduledActivity, LongWeekend } from "@/types/activity"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { TimeClashDetector, type TimeClash } from "@/utils/time-clash-detection"
import  ExportModal  from "@/components/export/ExportModal"
import WeatherWidget from "@/components/weather/WeatherWidget"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import  ErrorNotification  from "@/components/ErrorNotification"
import type { WeatherData } from "@/types/export"
import SmartIntegrations from "@/components/SmartIntegrations"
import HolidayAwareness from "@/components/HolidayAwareness"
import SmartRecommendations from "@/components/SmartRecommendations"


export default function HomePage() {
  const [activeSection, setActiveSection] = useState<"activities" | "schedule" | "holidays">("activities")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [timeClash, setTimeClash] = useState<TimeClash | null>(null)
  const [isTimeClashModalOpen, setIsTimeClashModalOpen] = useState(false)
  const [pendingActivityAdd, setPendingActivityAdd] = useState<{
    activity: Activity
    day: "friday" | "saturday" | "sunday" | "monday"
    timeSlot: "morning" | "afternoon" | "evening"
    sourceDay?: "friday" | "saturday" | "sunday" | "monday"
    sourceTimeSlot?: "morning" | "afternoon" | "evening"
  } | null>(null)
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<ScheduledActivity | null>(null)
  const [activityDetailsDay, setActivityDetailsDay] = useState<"friday" | "saturday" | "sunday" | "monday" | undefined>(undefined)
  const [activityDetailsTimeSlot, setActivityDetailsTimeSlot] = useState<"morning" | "afternoon" | "evening" | undefined>(undefined)
  const [isActivityDetailsModalOpen, setIsActivityDetailsModalOpen] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLongWeekendMode, setIsLongWeekendMode] = useState(false)
  const [availableDays, setAvailableDays] = useState<("friday" | "saturday" | "sunday" | "monday")[]>(["saturday", "sunday"])

  const { currentTheme } = useTheme()

  const {
    weekendSchedule,
    setWeekendSchedule,
    selectedCategory,
    setSelectedCategory,
    moodFilters,
    setMoodFilters,
    searchQuery,
    setSearchQuery,
    error: persistenceError,
    clearError: clearPersistenceError,
    clearAllData,
    recoverData,
  } = usePersistentState(currentTheme.id)

  const filteredActivities = useMemo(() => {
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
          activity.category.name.toLowerCase().includes(query),
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

    return filtered
  }, [selectedCategory, searchQuery, moodFilters])

  const scheduledActivityIds = useMemo(() => {
    const ids = new Set<string>()
    const allDays = ["friday", "saturday", "sunday", "monday"] as const

    allDays.forEach(day => {
      const daySchedule = weekendSchedule[day]
      if (daySchedule) {
        Object.values(daySchedule)
          .flat()
          .forEach((activity) => ids.add(activity.id))
      }
    })

    return ids
  }, [weekendSchedule])

  const totalPlannedActivities = scheduledActivityIds.size

  const handleAddToWeekend = (activityId: string) => {
    const activity = activities.find((a) => a.id === activityId)
    if (activity && !scheduledActivityIds.has(activityId)) {
      setSelectedActivity(activity)
      setIsModalOpen(true)
    }
  }

  const handleAddToSchedule = (
    activityId: string,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening",
  ) => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return

    const clash = TimeClashDetector.detectClash(weekendSchedule, activity, day, timeSlot)

    if (clash) {
      setTimeClash(clash)
      setPendingActivityAdd({ activity, day, timeSlot })
      setIsTimeClashModalOpen(true)
      return
    }

    addActivityToSchedule(activity, day, timeSlot)
  }

  const addActivityToSchedule = (
    activity: Activity,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening",
  ) => {
    setWeekendSchedule((prev) => {
      const daySchedule = prev[day] || { morning: [], afternoon: [], evening: [] }
      const scheduledActivity: ScheduledActivity = {
        ...activity,
        scheduledAt: { day, timeSlot }
      }
      return {
        ...prev,
        [day]: {
          ...daySchedule,
          [timeSlot]: [...daySchedule[timeSlot], scheduledActivity],
        },
      }
    })
  }

  const handleTimeClashConfirm = () => {
    if (pendingActivityAdd) {
      if (pendingActivityAdd.sourceDay && pendingActivityAdd.sourceTimeSlot) {
        // Drag and Drop move operation
        performActivityMove(
          pendingActivityAdd.activity,
          pendingActivityAdd.day,
          pendingActivityAdd.timeSlot,
          pendingActivityAdd.sourceDay,
          pendingActivityAdd.sourceTimeSlot
        )
      } else {
        // Normal add operation
        addActivityToSchedule(
          pendingActivityAdd.activity,
          pendingActivityAdd.day,
          pendingActivityAdd.timeSlot
        )
      }
      setPendingActivityAdd(null)
      setTimeClash(null)
    }
  }

  const handleTimeClashAlternative = (
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening"
  ) => {
    if (pendingActivityAdd) {
      if (pendingActivityAdd.sourceDay && pendingActivityAdd.sourceTimeSlot) {
        performActivityMove(
          pendingActivityAdd.activity,
          day,
          timeSlot,
          pendingActivityAdd.sourceDay,
          pendingActivityAdd.sourceTimeSlot
        )
      } else {
        addActivityToSchedule(pendingActivityAdd.activity, day, timeSlot)
      }
      setPendingActivityAdd(null)
      setTimeClash(null)
    }
  }

  const handleRemoveFromSchedule = (
    activityId: string,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening",
  ) => {
    setWeekendSchedule((prev) => {
      const daySchedule = prev[day]
      if (!daySchedule) return prev

      return {
        ...prev,
        [day]: {
          ...daySchedule,
          [timeSlot]: daySchedule[timeSlot].filter((activity) => activity.id !== activityId),
        },
      }
    })
  }

  const handleDropActivity = (
    activityId: string,
    targetDay: "friday" | "saturday" | "sunday" | "monday",
    targetTimeSlot: "morning" | "afternoon" | "evening",
    sourceDay?: "friday" | "saturday" | "sunday" | "monday",
    sourceTimeSlot?: "morning" | "afternoon" | "evening"
  ) => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return

    const tempSchedule = { ...weekendSchedule }

    if (sourceDay && sourceTimeSlot && tempSchedule[sourceDay]) {
      tempSchedule[sourceDay] = {
        ...tempSchedule[sourceDay],
        [sourceTimeSlot]: tempSchedule[sourceDay]![sourceTimeSlot].filter((a) => a.id !== activityId),
      }
    }

    // Check for time clash  
    const clash = TimeClashDetector.detectClash(tempSchedule, activity, targetDay, targetTimeSlot)

    if (clash) {
      // Show time clash modal 
      setTimeClash(clash)
      setPendingActivityAdd({
        activity,
        day: targetDay,
        timeSlot: targetTimeSlot,
        sourceDay,
        sourceTimeSlot
      })
      setIsTimeClashModalOpen(true)
      return
    }

    // No clash
    performActivityMove(activity, targetDay, targetTimeSlot, sourceDay, sourceTimeSlot)
  }

  const performActivityMove = (
    activity: Activity,
    targetDay: "friday" | "saturday" | "sunday" | "monday",
    targetTimeSlot: "morning" | "afternoon" | "evening",
    sourceDay?: "friday" | "saturday" | "sunday" | "monday",
    sourceTimeSlot?: "morning" | "afternoon" | "evening"
  ) => {
    const newSchedule = { ...weekendSchedule }

    // Find the original scheduled activity to preserve notes
    let originalScheduledActivity: ScheduledActivity | undefined
    if (sourceDay && sourceTimeSlot && newSchedule[sourceDay]) {
      originalScheduledActivity = newSchedule[sourceDay]![sourceTimeSlot].find((a) => a.id === activity.id)
    }

    // Remove from source if moving between time slots
    if (sourceDay && sourceTimeSlot && newSchedule[sourceDay]) {
      newSchedule[sourceDay] = {
        ...newSchedule[sourceDay],
        [sourceTimeSlot]: newSchedule[sourceDay]![sourceTimeSlot].filter((a) => a.id !== activity.id),
      }
    }

     
    if (!newSchedule[targetDay]) {
      newSchedule[targetDay] = { morning: [], afternoon: [], evening: [] }
    }

    // Create scheduled activity with preserved notes and updated location
    const scheduledActivity: ScheduledActivity = {
      ...activity,
      notes: originalScheduledActivity?.notes,
      scheduledAt: { day: targetDay, timeSlot: targetTimeSlot }
    }

    newSchedule[targetDay] = {
      ...newSchedule[targetDay],
      [targetTimeSlot]: [...newSchedule[targetDay]![targetTimeSlot], scheduledActivity],
    }

    // Update the schedule state with the new schedule
    setWeekendSchedule(newSchedule)
    setIsModalOpen(false)
  }



  const handleWeatherUpdate = (weatherData: WeatherData | null) => {
    setWeather(weatherData)
  }

  const handleSelectLongWeekend = (longWeekend: LongWeekend) => {
    setIsLongWeekendMode(true)
    setAvailableDays(longWeekend.days)
    setActiveSection("schedule")

    const newSchedule = { ...weekendSchedule }
    longWeekend.days.forEach(day => {
      if (!newSchedule[day]) {
        newSchedule[day] = { morning: [], afternoon: [], evening: [] }
      }
    })
    setWeekendSchedule(newSchedule)
  }

  const handlePlanHoliday = () => {
    setActiveSection("schedule")
  }

  // Activity details modal 
  const handleViewActivityDetails = (
    activity: ScheduledActivity,
    day?: "friday" | "saturday" | "sunday" | "monday",
    timeSlot?: "morning" | "afternoon" | "evening"
  ) => {
    setSelectedActivityForDetails(activity)
    setActivityDetailsDay(day)
    setActivityDetailsTimeSlot(timeSlot)
    setIsActivityDetailsModalOpen(true)
  }

  const handleUpdateActivityNotes = (notes: string) => {
    if (!selectedActivityForDetails || !activityDetailsDay || !activityDetailsTimeSlot) return

    setWeekendSchedule((prev) => {
      const newSchedule = { ...prev }
      const daySchedule = newSchedule[activityDetailsDay!]

      if (daySchedule) {
        newSchedule[activityDetailsDay!] = {
          ...daySchedule,
          [activityDetailsTimeSlot!]: daySchedule[activityDetailsTimeSlot!].map((activity) =>
            activity.id === selectedActivityForDetails.id
              ? { ...activity, notes }
              : activity
          ),
        }
      }

      return newSchedule
    })

    setSelectedActivityForDetails(prev => prev ? { ...prev, notes } : null)
  }


  return (
    <ErrorBoundary>
      <DragDropProvider onDropActivity={handleDropActivity}>
        <main
          className="min-h-screen transition-all duration-500"
          style={{
            background: currentTheme.backgroundPattern,
            backgroundColor: currentTheme.colors.background,
          }}
        >
          {/* Error Notifications */}
          <ErrorNotification
            error={persistenceError}
            onDismiss={clearPersistenceError}
            onRetry={recoverData}
            autoHide={persistenceError?.type === 'network'}
          />

          {/* Landing */}
          <HeroSection />

          <section className="py-6 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                  <ThemeSelector />
                </div>

              </div>
            </div>
          </section>

          <ScheduleNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            totalPlannedActivities={totalPlannedActivities}
          />

          {/* Activities Section */}
          {activeSection === "activities" && (
            <section id="activities" className="py-8 sm:py-12 lg:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight" style={{ color: currentTheme.colors.foreground }}>
                    Choose Your Adventure
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4 sm:px-0" style={{ color: currentTheme.colors.mutedForeground }}>
                    Discover amazing activities to make your weekend unforgettable. Filter by category and add your favorites
                    to start planning!
                  </p>
                </div>

                {/* Weather Widget */}
                <div className="mb-8">
                  <WeatherWidget onWeatherUpdate={handleWeatherUpdate} />
                </div>

                {/* Smart Integrations */}
                <div className="mb-8">
                  <SmartIntegrations />
                </div>

                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                  <EnhancedSearch
                    activities={activities}
                    categories={categories}
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory}
                    moodFilters={moodFilters}
                    onSearchChange={setSearchQuery}
                    onCategoryChange={setSelectedCategory}
                    onMoodChange={setMoodFilters}
                    onActivitySelect={handleAddToWeekend}
                  />

                  <MoodFilter onMoodChange={setMoodFilters} />
                </div>

                <ActivityGrid
                  activities={filteredActivities}
                  addedActivities={Array.from(scheduledActivityIds)}
                  onAddToWeekend={handleAddToWeekend}
                />

                {Object.values(weekendSchedule.saturday).flat().length > 0 ||
                  Object.values(weekendSchedule.sunday).flat().length > 0 ? (
                  <div className="mt-12 space-y-6">
                    <SmartRecommendations schedule={weekendSchedule} onAddActivity={handleAddToWeekend} />
                  </div>
                ) : null}
              </div>
            </section>
          )}



          {/* Holiday Section */}
          {activeSection === "holidays" && (
            <section id="holidays" className="py-8 sm:py-12 lg:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight" style={{ color: currentTheme.colors.foreground }}>
                    🏖️ Holiday Planning
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4 sm:px-0" style={{ color: currentTheme.colors.mutedForeground }}>
                    Discover upcoming long weekends and holidays to plan amazing getaways
                  </p>
                </div>

                <HolidayAwareness
                  onSelectLongWeekend={handleSelectLongWeekend}
                  onPlanHoliday={handlePlanHoliday}
                />
              </div>
            </section>
          )}

          <WeekendSchedule
            schedule={weekendSchedule}
            onRemoveActivity={handleRemoveFromSchedule}
            onScheduleChange={setWeekendSchedule}
            onViewActivityDetails={handleViewActivityDetails}
            clearAllData={clearAllData}
          />



          {/* Export & Share Modal */}
          {(Object.values(weekendSchedule.saturday).flat().length > 0 ||
            Object.values(weekendSchedule.sunday).flat().length > 0) && (
              <div className="fixed bottom-6 right-6 z-50">
                <ExportModal schedule={weekendSchedule} />
              </div>
            )}

          <TimeSlotModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            activity={selectedActivity}
            onAddToSchedule={handleAddToSchedule}
          />

          {/* Time Clash Modal */}
          <TimeClashModal
            isOpen={isTimeClashModalOpen}
            onClose={() => {
              setIsTimeClashModalOpen(false)
              setPendingActivityAdd(null)
              setTimeClash(null)
            }}
            clash={timeClash}
            activity={pendingActivityAdd?.activity || null}
            schedule={weekendSchedule}
            onConfirm={handleTimeClashConfirm}
            onSelectAlternative={handleTimeClashAlternative}
          />

          {/* Activity Details Modal */}
          <ActivityDetailsModal
            isOpen={isActivityDetailsModalOpen}
            onClose={() => {
              setIsActivityDetailsModalOpen(false)
              setSelectedActivityForDetails(null)
              setActivityDetailsDay(undefined)
              setActivityDetailsTimeSlot(undefined)
            }}
            activity={selectedActivityForDetails}
            activityNotes={selectedActivityForDetails?.notes || ""}
            onNotesChange={handleUpdateActivityNotes}
            day={activityDetailsDay}
            timeSlot={activityDetailsTimeSlot}
          />

        </main>
      </DragDropProvider>
    </ErrorBoundary>
  )
}

