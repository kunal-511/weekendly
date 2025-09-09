'use client'

import { useRef, useCallback, memo } from 'react'
import type { Activity } from "@/types/activity"
import { ActivityCard } from "./ActivityCard"
import { SkeletonActivityGrid } from "./SkeletonActivityCard"
import { useLazyActivities } from "@/hooks/use-lazy-activities"

interface ActivityGridProps {
  activities: Activity[]
  addedActivities: string[]
  onAddToWeekend: (activityId: string) => void
}

const ActivityGrid = memo(function ActivityGrid({ activities, addedActivities, onAddToWeekend }: ActivityGridProps) {
  const { 
    displayedActivities, 
    hasMore, 
    isLoading, 
    loadMore, 
    totalCount 
  } = useLazyActivities({ activities, itemsPerPage: 20 })
  
  const observerRef = useRef<IntersectionObserver | null>(null)

  const lastActivityRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    
    if (node) observerRef.current.observe(node)
  }, [isLoading, hasMore, loadMore])

  if (displayedActivities.length === 0 && isLoading) {
    return <SkeletonActivityGrid count={8} />
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Showing {displayedActivities.length} of {totalCount} activities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-4">
        {displayedActivities.map((activity, index) => {
          const isLast = index === displayedActivities.length - 1
          return (
            <div
              key={activity.id}
              ref={isLast ? lastActivityRef : null}
            >
              <ActivityCard
                activity={activity}
                isAdded={addedActivities.includes(activity.id)}
                onAddToWeekend={onAddToWeekend}
              />
            </div>
          )
        })}
      </div>

      {isLoading && hasMore && (
        <div className="py-8">
          <SkeletonActivityGrid count={4} />
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="text-center py-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Load More Activities
          </button>
        </div>
      )}

      {!hasMore && displayedActivities.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            You&apos;ve seen all {totalCount} activities! 
            {totalCount > 20 && " Try adjusting your filters to discover more."}
          </p>
        </div>
      )}

      {displayedActivities.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No activities found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search terms to find more activities.
          </p>
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.activities.length === nextProps.activities.length &&
    prevProps.addedActivities.length === nextProps.addedActivities.length &&
    prevProps.activities.every((activity, index) => activity.id === nextProps.activities[index]?.id) &&
    prevProps.addedActivities.every((id, index) => id === nextProps.addedActivities[index]) &&
    prevProps.onAddToWeekend === nextProps.onAddToWeekend
  )
})

export default ActivityGrid
