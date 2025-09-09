import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Activity } from '@/types/activity'

interface UseLazyActivitiesProps {
  activities: Activity[]
  itemsPerPage?: number
}

interface UseLazyActivitiesReturn {
  displayedActivities: Activity[]
  hasMore: boolean
  isLoading: boolean
  loadMore: () => void
  reset: () => void
  totalCount: number
}

export function useLazyActivities({ 
  activities, 
  itemsPerPage = 20 
}: UseLazyActivitiesProps): UseLazyActivitiesReturn {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const displayedActivities = useMemo(() => {
    return activities.slice(0, currentPage * itemsPerPage)
  }, [activities, currentPage, itemsPerPage])

  const hasMore = useMemo(() => {
    return displayedActivities.length < activities.length
  }, [displayedActivities.length, activities.length])

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true)
      setTimeout(() => {
        setCurrentPage(prev => prev + 1)
        setIsLoading(false)
      }, 300)
    }
  }, [hasMore, isLoading])

  const reset = useCallback(() => {
    setCurrentPage(1)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    reset()
  }, [activities, reset])

  return {
    displayedActivities,
    hasMore,
    isLoading,
    loadMore,
    reset,
    totalCount: activities.length
  }
}
