"use client"

import type React from "react"
import { memo } from "react"
import { useDraggable } from "@dnd-kit/core"
import type { Activity, CardVariation } from "@/types/activity"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Clock, Plus, GripVertical } from "lucide-react"
import { useDragDrop } from "@/contexts/drag-drop-context"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

interface DraggableActivityCardProps {
  activity: Activity
  isAdded: boolean
  onAddToWeekend: (activityId: string) => void
  variation?: CardVariation
}

const cardVariations = {
  minimal: "bg-white shadow-md rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-200",
  elevated:
    "bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-lg p-4 hover:shadow-xl transition-all duration-300 hover:scale-102",
  bordered:
    "bg-white border-2 border-gray-100 rounded-lg p-3 shadow-sm hover:border-gray-200 hover:shadow-md transition-all duration-150",
}

const rotationClasses = ["", "rotate-1", "-rotate-1"]

const getMoodEmojis = (activity: Activity) => {
  const energyEmoji = activity.mood.energy === "high" ? "⚡" : activity.mood.energy === "medium" ? "🔋" : "😴"
  const socialEmoji = activity.mood.social === "group" ? "👥" : activity.mood.social === "couple" ? "👫" : "🙋"
  const vibeEmojis = activity.mood.vibes.slice(0, 2).map((vibe) => {
    switch (vibe) {
      case "creative":
        return "🎨"
      case "mental":
        return "🧠"
      case "physical":
        return "💪"
      case "nature":
        return "🍃"
      case "indoor":
        return "🏠"
      default:
        return ""
    }
  })

  return { energyEmoji, socialEmoji, vibeEmojis }
}

const DraggableActivityCard = memo(function DraggableActivityCard({
  activity,
  isAdded,
  onAddToWeekend,
  variation = "minimal",
}: DraggableActivityCardProps) {
  const { isDragging: globalIsDragging, draggedActivity } = useDragDrop()
  const isMobile = useMobileDetection()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `activity-${activity.id}`,
    data: {
      activity,
      from: "catalog",
    },
    disabled: isAdded || isMobile, 
  })

  const getDeterministicRotation = (activityId: string): string => {
    let hash = 0
    for (let i = 0; i < activityId.length; i++) {
      const char = activityId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash 
    }
    return rotationClasses[Math.abs(hash) % rotationClasses.length]
  }
  const randomRotation = getDeterministicRotation(activity.id)
  const { energyEmoji, socialEmoji, vibeEmojis } = getMoodEmojis(activity)

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        group transition-all duration-200
        ${cardVariations[variation]}
        ${randomRotation}
        ${isDragging ? "opacity-50 scale-105 z-50 shadow-2xl" : ""}
        ${globalIsDragging && draggedActivity?.id === activity.id ? "opacity-30" : ""}
        ${isAdded ? "cursor-default" : isMobile ? "cursor-pointer" : "cursor-grab active:cursor-grabbing touch-manipulation select-none"}
      `}
      {...(isMobile ? {} : attributes)}
      {...(!isAdded && !isMobile ? listeners : {})}
    >
      <CardHeader className="pb-2 relative">
        {!isMobile && (
          <div 
            className="absolute top-1 right-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-grab touch-manipulation"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <div className="absolute top-1 left-1 flex gap-1">
          <span className="text-xs bg-white/80 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-sm">
            {energyEmoji}
          </span>
          <span className="text-xs bg-white/80 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-sm">
            {socialEmoji}
          </span>
          {vibeEmojis.slice(0, 1).map((emoji, index) => (
            <span key={index} className="text-xs bg-white/80 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-sm">
              {emoji}
            </span>
          ))}
        </div>
        <div className="flex items-start justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl transform group-hover:scale-110 transition-transform duration-200">
              {activity.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors leading-tight">
                {activity.title}
              </h3>
              <div
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activity.category.color} text-white shadow-sm mt-1`}
              >
                <span className="mr-1">{activity.category.icon}</span>
                {activity.category.name}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-gray-600 text-xs leading-relaxed mb-2 line-clamp-2">{activity.description}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="font-medium">{activity.duration}h</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></span>
            <span className="capitalize font-medium">{activity.mood.energy}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={() => onAddToWeekend(activity.id)}
          disabled={isAdded}
          className={`w-full transition-all duration-300 font-medium text-xs py-2 ${
            isAdded
              ? "bg-green-600 hover:bg-green-700 text-white shadow-md border-0"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:-translate-y-0.5 border-0"
          }`}
        >
          {isAdded ? (
            <>
              <span className="mr-1">✓</span>
              Added
            </>
          ) : (
            <>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.activity.id === nextProps.activity.id &&
    prevProps.isAdded === nextProps.isAdded &&
    prevProps.variation === nextProps.variation &&
    prevProps.onAddToWeekend === nextProps.onAddToWeekend
  )
})

export { DraggableActivityCard }
