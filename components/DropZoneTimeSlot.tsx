"use client"

import type React from "react"
import { useDroppable } from "@dnd-kit/core"
import type { ScheduledActivity } from "@/types/activity"
import { ScheduledActivityCard } from "./ScheduledActivityCard"
import { useDragDrop } from "@/contexts/drag-drop-context"

interface DropZoneTimeSlotProps {
  day: "friday" | "saturday" | "sunday" | "monday"
  timeSlot: "morning" | "afternoon" | "evening"
  timeRange: string
  icon: string
  activities: ScheduledActivity[]
  bgColor: string
  onRemoveActivity: (activityId: string) => void
  onDropActivity?: (
    activityId: string,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening",
  ) => void
  onViewActivityDetails?: (activity: ScheduledActivity, day?: "friday" | "saturday" | "sunday" | "monday", timeSlot?: "morning" | "afternoon" | "evening") => void
}

const timeSlotStyles = {
  morning: "rounded-lg shadow-sm",
  afternoon: "rounded-xl shadow-md",
  evening: "rounded-2xl shadow-lg",
}

export function DropZoneTimeSlot({
  day,
  timeSlot,
  timeRange,
  icon,
  activities,
  bgColor,
  onRemoveActivity,
  onViewActivityDetails,
}: DropZoneTimeSlotProps) {
  const { isDragging, dropTarget } = useDragDrop()
  
  const { isOver, setNodeRef } = useDroppable({
    id: `${day}-${timeSlot}`,
    data: {
      day,
      timeSlot,
    },
  })

  const isCurrentDropTarget = dropTarget?.day === day && dropTarget?.timeSlot === timeSlot
  const isValidDropZone = isDragging && (isOver || isCurrentDropTarget)

  return (
    <div
      ref={setNodeRef}
      className={`
        ${bgColor} p-3 sm:p-5 min-h-[180px] sm:min-h-[220px] transition-all duration-300 touch-manipulation
        ${timeSlotStyles[timeSlot]}
        ${isValidDropZone ? "ring-2 ring-blue-400 ring-opacity-60 sm:scale-105 shadow-xl bg-blue-50/30" : ""}
        ${isOver ? "ring-4 ring-blue-500 ring-opacity-80 bg-blue-100/40" : ""}
      `}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <span className="text-xl sm:text-2xl transform hover:scale-110 transition-transform">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-800 capitalize text-base sm:text-lg">{timeSlot}</h3>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">{timeRange}</p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-in slide-in-from-left-2 duration-300"
            >
              <ScheduledActivityCard 
                activity={activity} 
                onRemove={onRemoveActivity} 
                onViewDetails={onViewActivityDetails}
                day={day} 
                timeSlot={timeSlot} 
              />
            </div>
          ))
        ) : (
          <div
            className={`
            border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-300 touch-manipulation
            ${isValidDropZone ? "border-blue-400 bg-blue-50 sm:scale-105" : "border-gray-300 hover:border-gray-400"}
            ${isOver ? "border-blue-500 bg-blue-100" : ""}
          `}
          >
            <div className="flex flex-col items-center gap-2">
              {isOver ? (
                <>
                  <span className="text-2xl">✨</span>
                  <p className="text-blue-600 text-sm font-semibold">Drop here!</p>
                </>
              ) : isValidDropZone ? (
                <>
                  <span className="text-2xl">📍</span>
                  <p className="text-blue-600 text-sm font-semibold">Drop in {timeSlot}</p>
                </>
              ) : (
                <>
                  <span className="text-2xl opacity-60">📋</span>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">
                    Drop activities here
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {activities.length > 3 && (
        <div className="mt-3 text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded-full border border-amber-200 animate-pulse">
          ⚠️ This time slot is getting busy!
        </div>
      )}
    </div>
  )
}
