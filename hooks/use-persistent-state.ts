import { useState, useEffect, useCallback, useRef } from "react"
import indexedDBService from "@/utils/indexeddb-service"
import { ErrorHandler, type UserFriendlyError } from "@/utils/error-handler"
import type { WeekendSchedule } from "@/types/activity"
import type { MoodFilters } from "@/components/MoodFilters"
import type { UserPreferences } from "@/utils/indexeddb-service"

interface UsePersistentStateReturn {
  weekendSchedule: WeekendSchedule
  setWeekendSchedule: React.Dispatch<React.SetStateAction<WeekendSchedule>>
  selectedCategory: string
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>
  moodFilters: MoodFilters
  setMoodFilters: React.Dispatch<React.SetStateAction<MoodFilters>>
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  isInitialized: boolean
  error: UserFriendlyError | null
  clearError: () => void
  hasUnsavedChanges: boolean
  clearAllData: () => Promise<void>
  recoverData: () => Promise<void>
}

export function usePersistentState(currentTheme: string): UsePersistentStateReturn {
  const [weekendSchedule, setWeekendScheduleState] = useState<WeekendSchedule>({
    saturday: { morning: [], afternoon: [], evening: [] },
    sunday: { morning: [], afternoon: [], evening: [] },
  })
  const [selectedCategory, setSelectedCategoryState] = useState("all")
  const [moodFilters, setMoodFiltersState] = useState<MoodFilters>({ 
    energy: [], 
    social: [], 
    vibes: [] 
  })
  const [searchQuery, setSearchQueryState] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<UserFriendlyError | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const isLoadingFromDB = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const backupDataRef = useRef<{
    schedule: WeekendSchedule
    preferences: UserPreferences
  } | null>(null)

  // Fallback to localStorage 
  const tryLocalStorageFallback = useCallback(async () => {
    try {
      const savedSchedule = localStorage.getItem('weekendly-schedule')
      const savedPreferences = localStorage.getItem('weekendly-preferences')
      
      if (savedSchedule) {
        const schedule = JSON.parse(savedSchedule)
        setWeekendScheduleState(schedule)
      }
      
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences)
        setSelectedCategoryState(preferences.selectedCategory || 'all')
        setMoodFiltersState(preferences.moodFilters || { energy: [], social: [], vibes: [] })
        setSearchQueryState(preferences.searchQuery || '')
      }
    } catch (err) {
      console.error('LocalStorage fallback failed:', err)
    }
  }, [])

  // Initialize IndexedDB 
  useEffect(() => {
    const initializeDB = async () => {
      try {
        setIsLoading(true)
        isLoadingFromDB.current = true
        
        await indexedDBService.init()
        
        const savedSchedule = await indexedDBService.loadWeekendSchedule()
        if (savedSchedule) {
          setWeekendScheduleState(savedSchedule)
        }

        setIsInitialized(true)
      } catch (err) {
        console.error("Failed to initialize persistent state:", err)
        const friendlyError = ErrorHandler.handleError(err)
        setError(friendlyError)
        
        await tryLocalStorageFallback()
        
        setIsInitialized(true) 
      } finally {
        setIsLoading(false)
        isLoadingFromDB.current = false
      }
    }

    initializeDB()
  }, [tryLocalStorageFallback])



  const debouncedSave = useCallback((
    schedule: WeekendSchedule,
    preferences: UserPreferences
  ) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setHasUnsavedChanges(true)

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await ErrorHandler.retryWithBackoff(async () => {
          await Promise.all([
            indexedDBService.saveWeekendSchedule(schedule),
          ])
        }, 3, 1000)
        
        setHasUnsavedChanges(false)
        setError(null) 
        
        //  localStorage as backup
        localStorage.setItem('weekendly-schedule', JSON.stringify(schedule))
        localStorage.setItem('weekendly-preferences', JSON.stringify(preferences))
      } catch (err) {
        console.error("Failed to save data:", err)
        const friendlyError = ErrorHandler.handleError(err)
        setError(friendlyError)
        setHasUnsavedChanges(true)
      }
    }, 500) // 500ms debounce
  }, [])

  // Save weekend schedule when it changes
  useEffect(() => {
    if (!isInitialized || isLoadingFromDB.current) return

    const preferences: UserPreferences = {
      selectedCategory,
      moodFilters,
      searchQuery,
      currentTheme
    }

    debouncedSave(weekendSchedule, preferences)
  }, [weekendSchedule, selectedCategory, moodFilters, searchQuery, currentTheme, isInitialized, debouncedSave])

  // Wrapper functions that handle saving
  const setWeekendSchedule = useCallback((
    value: WeekendSchedule | ((prev: WeekendSchedule) => WeekendSchedule)
  ) => {
    setWeekendScheduleState(value)
  }, [])

  const setSelectedCategory = useCallback((
    value: string | ((prev: string) => string)
  ) => {
    setSelectedCategoryState(value)
  }, [])

  const setMoodFilters = useCallback((
    value: MoodFilters | ((prev: MoodFilters) => MoodFilters)
  ) => {
    setMoodFiltersState(value)
  }, [])

  const setSearchQuery = useCallback((
    value: string | ((prev: string) => string)
  ) => {
    setSearchQueryState(value)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const recoverData = useCallback(async () => {
    try {
      if (backupDataRef.current) {
        // Restore from memory backup
        setWeekendScheduleState(backupDataRef.current.schedule)
        setSelectedCategoryState(backupDataRef.current.preferences.selectedCategory)
        setMoodFiltersState(backupDataRef.current.preferences.moodFilters)
        setSearchQueryState(backupDataRef.current.preferences.searchQuery)
        setError(null)
        return
      }
      
      // Try to recover from localStorage backup
      const backupSchedule = localStorage.getItem('weekendly-schedule-backup')
      const backupPreferences = localStorage.getItem('weekendly-preferences-backup')
      
      if (backupSchedule) {
        const schedule = JSON.parse(backupSchedule)
        setWeekendScheduleState(schedule)
      }
      
      if (backupPreferences) {
        const preferences = JSON.parse(backupPreferences)
        setSelectedCategoryState(preferences.selectedCategory || 'all')
        setMoodFiltersState(preferences.moodFilters || { energy: [], social: [], vibes: [] })
        setSearchQueryState(preferences.searchQuery || '')
      }
      
      setError(null)
    } catch (err) {
      console.error('Data recovery failed:', err)
      const friendlyError = ErrorHandler.handleError(err)
      setError(friendlyError)
    }
  }, [])

  const clearAllData = useCallback(async () => {
    try {
      
      await ErrorHandler.retryWithBackoff(async () => {
        await indexedDBService.clearAllData()
      }, 2, 1000)
      
      // Clear localStorage backups too
      localStorage.removeItem('weekendly-schedule')
      localStorage.removeItem('weekendly-preferences')
      localStorage.removeItem('weekendly-schedule-backup')
      localStorage.removeItem('weekendly-preferences-backup')
      
      // Reset all state to defaults
      setWeekendScheduleState({
        saturday: { morning: [], afternoon: [], evening: [] },
        sunday: { morning: [], afternoon: [], evening: [] },
      })
      setSelectedCategoryState("all")
      setMoodFiltersState({ energy: [], social: [], vibes: [] })
      setSearchQueryState("")
      setError(null)
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error("Failed to clear data:", err)
      const friendlyError = ErrorHandler.handleError(err)
      setError(friendlyError)
      throw err
    }
  }, [])



  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    weekendSchedule,
    setWeekendSchedule,
    selectedCategory,
    setSelectedCategory,
    moodFilters,
    setMoodFilters,
    searchQuery,
    setSearchQuery,
    isLoading,
    isInitialized,
    error,
    clearError,
    hasUnsavedChanges,
    clearAllData,
    recoverData
  }
}
