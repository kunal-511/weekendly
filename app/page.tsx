"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import HeroSection from "@/components/HeroSection"
import ActivityGrid from "@/components/ActivityGrid"
import ScheduleNavigation from "@/components/ScheduleNavigation"
import WeekendSchedule from "@/components/WeekendSchedule"
import TimeSlotModal from "@/components/TimeSlotModal"
import EnhancedSearch from "@/components/EnhancedSearch"
import TimeClashModal from "@/components/TimeClashModal"
import ActivityDetailsModal from "@/components/ActivityDetailsModal"
import ThemeSelector from "@/components/ ThemeSelector"
import MoodFilter from "@/components/MoodFilters"
import { DragDropProvider } from "@/contexts/drag-drop-context"
import { useTheme } from "@/contexts/theme-context"
import { activities, categories } from "@/data/actvity"
import type { Activity, ScheduledActivity } from "@/types/activity"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { TimeClashDetector, type TimeClash } from "@/utils/time-clash-detection"
import ExportModal from "@/components/export/ExportModal"
import WeatherWidget from "@/components/weather/WeatherWidget"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import ErrorNotification from "@/components/ErrorNotification"
import type { WeatherData } from "@/types/export"
import SmartIntegrations from "@/components/SmartIntegrations"
import SmartRecommendations from "@/components/SmartRecommendations"


export default function HomePage() {
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<"activities" | "schedule">("activities")
  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'activities' || section === 'schedule') {
      setActiveSection(section)
    }
  }, [searchParams])
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

          {/* Theme Selector */}
          <section className="py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                  <ThemeSelector />
                </div>
              </div>
            </div>
          </section>



          <div className="m-4">
            {/* Weather Widget */}
            <div className="mb-4">
              <WeatherWidget onWeatherUpdate={handleWeatherUpdate} />
            </div>

            {/* Smart Integrations  */}
            <div className="mb-4">
              <SmartIntegrations />
            </div>
          </div>
          {/* Navigation */}
          <ScheduleNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            totalPlannedActivities={totalPlannedActivities}
          />
          {/* Main Layout*/}
          {(activeSection === "activities" || activeSection === "schedule") && (
            <section id="activities" className="py-8 sm:py-12 lg:py-16">
              <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-[80vh]">

                  {/* Left Side - Activities Panel */}
                  <div className="lg:w-2/5 xl:w-1/3 flex flex-col ">
                    <div className="backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg flex-1 flex flex-col bg-white/80 max-h-[160vh] overflow-y-hidden">
                      <div className="p-6 pb-4 border-b border-gray-100">
                        <div className="text-center mb-6">
                          <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight" style={{ color: currentTheme.colors.foreground }}>
                            🎯 Choose Activities
                          </h2>
                          <p className="text-sm sm:text-base text-gray-600">
                            Discover and add activities to your weekend plan
                          </p>
                        </div>



                        {/* Search and Filters */}
                        <div className="space-y-3">
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
                      </div>

                      {/* Activities Grid */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        <ActivityGrid
                          activities={filteredActivities}
                          addedActivities={Array.from(scheduledActivityIds)}
                          onAddToWeekend={handleAddToWeekend}
                        />

                        {/* Smart Recommendations */}
                        {(Object.values(weekendSchedule.saturday).flat().length > 0 ||
                          Object.values(weekendSchedule.sunday).flat().length > 0) && (
                            <div className="mt-8">
                              <SmartRecommendations schedule={weekendSchedule} onAddActivity={handleAddToWeekend} />
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Schedule Panel */}
                  <div className="lg:w-3/5 xl:w-2/3 flex flex-col">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg flex-1">
                      <WeekendSchedule
                        schedule={weekendSchedule}
                        onRemoveActivity={handleRemoveFromSchedule}
                        onScheduleChange={setWeekendSchedule}
                        onViewActivityDetails={handleViewActivityDetails}
                        clearAllData={clearAllData}
                      />
                    </div>
                  </div>

                </div>
              </div>
            </section>
          )}

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

