import type { ScheduledActivity } from "@/types/activity"
import { DropZoneTimeSlot } from "./DropZoneTimeSlot"

interface DayColumnProps {
  day: "friday" | "saturday" | "sunday" | "monday"
  schedule: {
    morning: ScheduledActivity[]
    afternoon: ScheduledActivity[]
    evening: ScheduledActivity[]
  }
  onRemoveActivity: (
    activityId: string,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening",
  ) => void
  onViewActivityDetails?: (activity: ScheduledActivity, day?: "friday" | "saturday" | "sunday" | "monday", timeSlot?: "morning" | "afternoon" | "evening") => void
}

export function DayColumn({ day, schedule, onRemoveActivity, onViewActivityDetails }: DayColumnProps) {
  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
  const dayBg = {
    friday: "bg-purple-50/50",
    saturday: "bg-blue-50/50", 
    sunday: "bg-green-50/50",
    monday: "bg-yellow-50/50"
  }[day]

  return (
    <div className={`${dayBg} rounded-lg p-4`}>
      <h2 className="text-lg font-bold text-center mb-4 text-foreground">{dayLabel}</h2>

      <div className="space-y-4">
        <DropZoneTimeSlot
          day={day}
          timeSlot="morning"
          timeRange="8 AM - 12 PM"
          icon="🌅"
          activities={schedule.morning}
          bgColor="bg-yellow-50"
          onRemoveActivity={(activityId) => onRemoveActivity(activityId, day, "morning")}
          onDropActivity={() => {}} 
          onViewActivityDetails={onViewActivityDetails}
        />

        <DropZoneTimeSlot
          day={day}
          timeSlot="afternoon"
          timeRange="12 PM - 6 PM"
          icon="☀️"
          activities={schedule.afternoon}
          bgColor="bg-blue-50"
          onRemoveActivity={(activityId) => onRemoveActivity(activityId, day, "afternoon")}
          onDropActivity={() => {}} 
          onViewActivityDetails={onViewActivityDetails}
        />

        <DropZoneTimeSlot
          day={day}
          timeSlot="evening"
          timeRange="6 PM - 11 PM"
          icon="🌙"
          activities={schedule.evening}
          bgColor="bg-purple-50"
          onRemoveActivity={(activityId) => onRemoveActivity(activityId, day, "evening")}
          onDropActivity={() => {}} 
          onViewActivityDetails={onViewActivityDetails}
        />
      </div>
    </div>
  )
}
