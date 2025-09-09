export interface ActivityCategory {
  id: string
  name: string
  color: string
  icon: string
}

export interface Activity {
  id: string
  title: string
  description: string
  category: ActivityCategory
  duration: number // in hours
  icon: string // emoji or lucide icon name
  mood: ActivityMood
}

export interface ScheduledActivity extends Activity {
  notes?: string
  scheduledAt?: {
    day: "friday" | "saturday" | "sunday" | "monday"
    timeSlot: "morning" | "afternoon" | "evening"
  }
}

export interface ActivityMood {
  energy: "high" | "medium" | "low"
  social: "group" | "couple" | "solo"
  vibes: Array<"creative" | "mental" | "physical" | "nature" | "indoor">
}

export interface ScheduleSlot {
  id: string
  day: "friday" | "saturday" | "sunday" | "monday"
  timeSlot: "morning" | "afternoon" | "evening"
  activities: Activity[]
  timeRange: string
}

export interface WeekendSchedule {
  friday?: {
    morning: ScheduledActivity[]
    afternoon: ScheduledActivity[]
    evening: ScheduledActivity[]
  }
  saturday: {
    morning: ScheduledActivity[]
    afternoon: ScheduledActivity[]
    evening: ScheduledActivity[]
  }
  sunday: {
    morning: ScheduledActivity[]
    afternoon: ScheduledActivity[]
    evening: ScheduledActivity[]
  }
  monday?: {
    morning: ScheduledActivity[]
    afternoon: ScheduledActivity[]
    evening: ScheduledActivity[]
  }
}

export interface Theme {
  id: "chill" | "adventure" | "social"
  name: string
  description: string
  colors: ThemeColors
  recommendedActivities: string[]
  moodEmphasis: Array<"high" | "medium" | "low">
  backgroundPattern: string
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
}

export interface Recommendation {
  id: string
  type: "mood-balance" | "theme-suggestion" | "time-optimization"
  title: string
  description: string
  suggestedActivities: string[]
  priority: "high" | "medium" | "low"
}

export interface WeekendInsights {
  energyDistribution: Record<string, number>
  socialBalance: Record<string, number>
  categoryBreakdown: Record<string, number>
  recommendations: Recommendation[]
  completionScore: number
  moodBalance: {
    energy: { high: number; medium: number; low: number }
    social: { group: number; couple: number; solo: number }
    vibes: Record<string, number>
  }
}

export interface DragState {
  isDragging: boolean
  draggedActivity: Activity | null
  draggedFrom: "catalog" | "schedule"
  sourceTimeSlot?: { day: "saturday" | "sunday"; timeSlot: "morning" | "afternoon" | "evening" }
  dropTarget: { day: "saturday" | "sunday"; timeSlot: "morning" | "afternoon" | "evening" } | null
  dragPreviewPosition: { x: number; y: number }
}

export type CardVariation = "minimal" | "elevated" | "bordered"



export interface Holiday {
  id: string
  name: string
  date: string
  type: "national" | "regional" | "cultural" | "religious"
  description?: string
}

export interface LongWeekend {
  id: string
  name: string
  startDate: string
  endDate: string
  days: ("friday" | "saturday" | "sunday" | "monday")[]
  holiday?: Holiday
  daysCount: number
}
