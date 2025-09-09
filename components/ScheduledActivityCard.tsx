"use client"

import { memo } from "react"
import { X, GripVertical, Info } from "lucide-react"
import { useDraggable } from "@dnd-kit/core"
import type { ScheduledActivity } from "@/types/activity"
import { useDragDrop } from "@/contexts/drag-drop-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

interface ScheduledActivityCardProps {
  activity: ScheduledActivity
  onRemove: (activityId: string) => void
  onViewDetails?: (activity: ScheduledActivity, day?: "friday" | "saturday" | "sunday" | "monday", timeSlot?: "morning" | "afternoon" | "evening") => void
  day?: "friday" | "saturday" | "sunday" | "monday"
  timeSlot?: "morning" | "afternoon" | "evening"
}

const ScheduledActivityCard = memo(function ScheduledActivityCard({ activity, onRemove, onViewDetails, day, timeSlot }: ScheduledActivityCardProps) {
  const { isDragging: globalIsDragging, draggedActivity } = useDragDrop()
  const isMobile = useMobileDetection()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `scheduled-${activity.id}-${day}-${timeSlot}`,
    data: {
      activity,
      from: "schedule",
      sourceTimeSlot: day && timeSlot ? { day, timeSlot } : undefined,
    },
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      return
    }
    onViewDetails?.(activity, day, timeSlot)
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing touch-manipulation select-none
        ${isDragging ? "opacity-50 scale-105 z-50 shadow-2xl" : ""}
        ${globalIsDragging && draggedActivity?.id === activity.id ? "opacity-30" : ""}
        ${onViewDetails ? "hover:border-blue-300" : ""}
      `}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
    >
      <button
        onClick={() => onRemove(activity.id)}
        className={`absolute -top-2 -right-2 w-7 h-7 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center transition-opacity hover:bg-red-600 z-10 touch-manipulation ${
          isMobile ? "opacity-80" : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
        }`}
      >
        <X className="w-3 h-3" />
      </button>

      <div 
        className={`absolute -top-1 -left-1 transition-opacity cursor-grab touch-manipulation ${
          isMobile ? "opacity-60" : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
        }`}
        data-drag-handle
      >
        <GripVertical className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400" />
      </div>

      {onViewDetails && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(activity, day, timeSlot)
          }}
          className={`absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center transition-opacity hover:bg-blue-600 z-10 touch-manipulation ${
            isMobile ? "opacity-80" : "opacity-0 sm:group-hover:opacity-100"
          }`}
          title="View details and add notes"
        >
          <Info className="w-3 h-3" />
        </button>
      )}

      {activity.notes && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" title="Has notes" />
      )}

      <div className={`w-1 h-full absolute left-0 top-0 rounded-l-lg ${activity.category.color}`}></div>

      <div className="flex items-center gap-2 ml-2">
        <span className="text-lg">{activity.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">{activity.title}</h4>
          <p className="text-xs text-muted-foreground">
            {activity.duration}h • {activity.mood.energy} energy • {activity.mood.social}
          </p>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.activity.id === nextProps.activity.id &&
    prevProps.activity.notes === nextProps.activity.notes &&
    prevProps.day === nextProps.day &&
    prevProps.timeSlot === nextProps.timeSlot &&
    prevProps.onRemove === nextProps.onRemove &&
    prevProps.onViewDetails === nextProps.onViewDetails
  )
})

export { ScheduledActivityCard }
