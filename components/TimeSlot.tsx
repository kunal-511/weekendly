import type { Activity } from "@/types/activity"
import { ScheduledActivityCard } from "./ScheduledActivityCard"

interface TimeSlotProps {
  timeSlot: "morning" | "afternoon" | "evening"
  timeRange: string
  icon: string
  activities: Activity[]
  bgColor: string
  onRemoveActivity: (activityId: string) => void
}

export function TimeSlot({ timeSlot, timeRange, icon, activities, bgColor, onRemoveActivity }: TimeSlotProps) {
  return (
    <div className={`${bgColor} rounded-lg p-4 min-h-[200px]`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-foreground capitalize">{timeSlot}</h3>
          <p className="text-sm text-muted-foreground">{timeRange}</p>
        </div>
      </div>

      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ScheduledActivityCard key={activity.id} activity={activity} onRemove={onRemoveActivity} />
          ))
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground text-sm">Drop activities here</p>
          </div>
        )}
      </div>

      {activities.length > 3 && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">⚠️ Time slot might be crowded</div>
      )}
    </div>
  )
}
