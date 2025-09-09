import type { Activity, CardVariation } from "@/types/activity"
import { DraggableActivityCard } from "./DraggableActivityCard"

interface ActivityCardProps {
  activity: Activity
  isAdded: boolean
  onAddToWeekend: (activityId: string) => void
}

const getDeterministicVariation = (activityId: string): CardVariation => {
  const variations: CardVariation[] = ["minimal", "elevated", "bordered"]
  let hash = 0
  for (let i = 0; i < activityId.length; i++) {
    const char = activityId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash 
  }
  return variations[Math.abs(hash) % variations.length]
}

export function ActivityCard({ activity, isAdded, onAddToWeekend }: ActivityCardProps) {
  const variation = getDeterministicVariation(activity.id)

  return (
    <DraggableActivityCard
      activity={activity}
      isAdded={isAdded}
      onAddToWeekend={onAddToWeekend}
      variation={variation}
    />
  )
}
