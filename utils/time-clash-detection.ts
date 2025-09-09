import type { Activity, WeekendSchedule } from "@/types/activity"

export interface TimeSlotInfo {
  label: string
  startHour: number
  endHour: number
  totalHours: number
}

export interface TimeClash {
  day: "friday" | "saturday" | "sunday" | "monday"
  timeSlot: "morning" | "afternoon" | "evening"
  currentDuration: number
  availableHours: number
  activityDuration: number
  overflowHours: number
  existingActivities: Activity[]
}

export const TIME_SLOTS: Record<string, TimeSlotInfo> = {
  morning: {
    label: "Morning (8:00 AM - 12:00 PM)",
    startHour: 8,
    endHour: 12,
    totalHours: 4
  },
  afternoon: {
    label: "Afternoon (12:00 PM - 6:00 PM)",
    startHour: 12,
    endHour: 18,
    totalHours: 6
  },
  evening: {
    label: "Evening (6:00 PM - 11:00 PM)",
    startHour: 18,
    endHour: 23,
    totalHours: 5
  }
}

export class TimeClashDetector {
  // Check for a time clash when adding an activity
  static detectClash(
    schedule: WeekendSchedule,
    activity: Activity,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening"
  ): TimeClash | null {
    const daySchedule = schedule[day]
    if (!daySchedule) return null

    const existingActivities = daySchedule[timeSlot] || []
    const currentDuration = existingActivities.reduce((total, act) => total + act.duration, 0)
    const slotInfo = TIME_SLOTS[timeSlot]
    const availableHours = slotInfo.totalHours - currentDuration

    if (activity.duration > availableHours) {
      const overflowHours = activity.duration - availableHours

      return {
        day,
        timeSlot,
        currentDuration,
        availableHours,
        activityDuration: activity.duration,
        overflowHours,
        existingActivities
      }
    }

    return null
  }

  static getTimeSlotDuration(
    schedule: WeekendSchedule,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening"
  ): number {
    const daySchedule = schedule[day]
    if (!daySchedule) return 0

    const activities = daySchedule[timeSlot] || []
    return activities.reduce((total, activity) => total + activity.duration, 0)
  }


  static getAvailableHours(
    schedule: WeekendSchedule,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening"
  ): number {
    const slotInfo = TIME_SLOTS[timeSlot]
    const currentDuration = this.getTimeSlotDuration(schedule, day, timeSlot)
    return Math.max(0, slotInfo.totalHours - currentDuration)
  }

  // get all time clashes 
  static findAllClashes(schedule: WeekendSchedule): TimeClash[] {
    const clashes: TimeClash[] = []
    const days = ["friday", "saturday", "sunday", "monday"] as const
    const timeSlots = ["morning", "afternoon", "evening"] as const

    days.forEach(day => {
      const daySchedule = schedule[day]
      if (!daySchedule) return

      timeSlots.forEach(timeSlot => {
        const activities = daySchedule[timeSlot] || []
        const totalDuration = activities.reduce((total, act) => total + act.duration, 0)
        const slotInfo = TIME_SLOTS[timeSlot]

        if (totalDuration > slotInfo.totalHours) {
          clashes.push({
            day,
            timeSlot,
            currentDuration: totalDuration,
            availableHours: 0,
            activityDuration: 0,
            overflowHours: totalDuration - slotInfo.totalHours,
            existingActivities: activities
          })
        }
      })
    })

    return clashes
  }


  //Suggest alternative time slots 
  static suggestAlternativeSlots(
    schedule: WeekendSchedule,
    activity: Activity,
    excludeDay?: "friday" | "saturday" | "sunday" | "monday",
    excludeTimeSlot?: "morning" | "afternoon" | "evening"
  ): Array<{
    day: "friday" | "saturday" | "sunday" | "monday"
    timeSlot: "morning" | "afternoon" | "evening"
    availableHours: number
    slotInfo: TimeSlotInfo
  }> {
    const suggestions: Array<{
      day: "friday" | "saturday" | "sunday" | "monday"
      timeSlot: "morning" | "afternoon" | "evening"
      availableHours: number
      slotInfo: TimeSlotInfo
    }> = []

    const days = ["friday", "saturday", "sunday", "monday"] as const
    const timeSlots = ["morning", "afternoon", "evening"] as const

    days.forEach(day => {
      if (day === excludeDay) return
      if (!schedule[day]) return

      timeSlots.forEach(timeSlot => {
        if (day === excludeDay && timeSlot === excludeTimeSlot) return

        const availableHours = this.getAvailableHours(schedule, day, timeSlot)

        if (availableHours >= activity.duration) {
          suggestions.push({
            day,
            timeSlot,
            availableHours,
            slotInfo: TIME_SLOTS[timeSlot]
          })
        }
      })
    })

    return suggestions.sort((a, b) => b.availableHours - a.availableHours)
  }

  
  static formatClashMessage(clash: TimeClash, activity: Activity): string {
    const slotInfo = TIME_SLOTS[clash.timeSlot]
    return `The ${activity.title} activity (${activity.duration}h) won't fit in ${clash.day.charAt(0).toUpperCase() + clash.day.slice(1)} ${clash.timeSlot} (${slotInfo.label}). You have ${clash.availableHours}h available, but need ${clash.activityDuration}h. This would overflow by ${clash.overflowHours}h.`
  }


  static getTimeSlotUtilization(
    schedule: WeekendSchedule,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening"
  ): number {
    const slotInfo = TIME_SLOTS[timeSlot]
    const currentDuration = this.getTimeSlotDuration(schedule, day, timeSlot)
    return Math.min(100, (currentDuration / slotInfo.totalHours) * 100)
  }
}
