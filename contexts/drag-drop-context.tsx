"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import type { Activity } from "@/types/activity"

interface DragDropContextType {
  isDragging: boolean
  draggedActivity: Activity | null
  draggedFrom: "catalog" | "schedule" | null
  sourceTimeSlot?: { day: "friday" | "saturday" | "sunday" | "monday"; timeSlot: "morning" | "afternoon" | "evening" }
  dropTarget: { day: "friday" | "saturday" | "sunday" | "monday"; timeSlot: "morning" | "afternoon" | "evening" } | null
  onDragStart: (event: DragStartEvent) => void
  onDragOver: (event: DragOverEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined)

interface DragDropProviderProps {
  children: ReactNode
  onDropActivity: (
    activityId: string,
    targetDay: "friday" | "saturday" | "sunday" | "monday",
    targetTimeSlot: "morning" | "afternoon" | "evening",
    sourceDay?: "friday" | "saturday" | "sunday" | "monday",
    sourceTimeSlot?: "morning" | "afternoon" | "evening"
  ) => void
}

export function DragDropProvider({ children, onDropActivity }: DragDropProviderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null)
  const [draggedFrom, setDraggedFrom] = useState<"catalog" | "schedule" | null>(null)
  const [sourceTimeSlot, setSourceTimeSlot] = useState<{ day: "friday" | "saturday" | "sunday" | "monday"; timeSlot: "morning" | "afternoon" | "evening" }>()
  const [dropTarget, setDropTarget] = useState<{ day: "friday" | "saturday" | "sunday" | "monday"; timeSlot: "morning" | "afternoon" | "evening" } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activityData = active.data.current
    
    if (activityData) {
      setIsDragging(true)
      setDraggedActivity(activityData.activity)
      setDraggedFrom(activityData.from)
      setSourceTimeSlot(activityData.sourceTimeSlot)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    
    if (over && over.data.current) {
      const targetData = over.data.current
      setDropTarget({
        day: targetData.day,
        timeSlot: targetData.timeSlot,
      })
    } else {
      setDropTarget(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && over.data.current && active.data.current) {
      const activityData = active.data.current
      const targetData = over.data.current
      
      onDropActivity(
        activityData.activity.id,
        targetData.day,
        targetData.timeSlot,
        activityData.sourceTimeSlot?.day,
        activityData.sourceTimeSlot?.timeSlot
      )
    }
    
    // Reset drag state
    setIsDragging(false)
    setDraggedActivity(null)
    setDraggedFrom(null)
    setSourceTimeSlot(undefined)
    setDropTarget(null)
  }

  const contextValue: DragDropContextType = {
    isDragging,
    draggedActivity,
    draggedFrom,
    sourceTimeSlot,
    dropTarget,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
  }

  return (
    <DragDropContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        id="weekendly-dnd-context"
      >
        {children}
        <DragOverlay>
          {draggedActivity ? (
            <div className="opacity-90 transform rotate-3 scale-105 shadow-2xl">
              <ActivityDragPreview activity={draggedActivity} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  )
}

function ActivityDragPreview({ activity }: { activity: Activity }) {
  return (
    <div className="bg-white border-2 border-blue-300 rounded-lg p-3 shadow-lg max-w-xs">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{activity.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-800 truncate">{activity.title}</h3>
          <p className="text-xs text-gray-600 truncate">{activity.description}</p>
        </div>
      </div>
    </div>
  )
}

export function useDragDrop() {
  const context = useContext(DragDropContext)
  if (context === undefined) {
    throw new Error("useDragDrop must be used within a DragDropProvider")
  }
  return context
}
