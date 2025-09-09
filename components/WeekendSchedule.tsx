import type { WeekendSchedule as WeekendScheduleType, ScheduledActivity } from "@/types/activity"
import { DayColumn } from "./DayColumn"
import ClearData from "./ClearData"

interface WeekendScheduleProps {
  schedule: WeekendScheduleType
  onRemoveActivity: (
    activityId: string,
    day: "friday" | "saturday" | "sunday" | "monday",
    timeSlot: "morning" | "afternoon" | "evening",
  ) => void
  onScheduleChange?: (newSchedule: WeekendScheduleType) => void
  onViewActivityDetails?: (activity: ScheduledActivity, day?: "friday" | "saturday" | "sunday" | "monday", timeSlot?: "morning" | "afternoon" | "evening") => void
  clearAllData: () => Promise<void>
}

export default function WeekendSchedule({ schedule, onRemoveActivity, onScheduleChange, onViewActivityDetails, clearAllData}: WeekendScheduleProps) {
  const activeDays = (["friday", "saturday", "sunday", "monday"] as const).filter(day => schedule[day])
  const totalActivities = activeDays.reduce((total, day) => {
    const daySchedule = schedule[day]
    if (daySchedule) {
      return total + Object.values(daySchedule).flat().length
    }
    return total
  }, 0)

  const isLongWeekend = activeDays.length > 2

  const handleDayToggle = (day: "friday" | "saturday" | "sunday" | "monday") => {
    if (!onScheduleChange) return

    const newSchedule = { ...schedule }

    if (activeDays.includes(day)) {
      delete newSchedule[day]
    } else {
      newSchedule[day] = {
        morning: [],
        afternoon: [],
        evening: []
      }
    }

    onScheduleChange(newSchedule)
  }

  return (
    <section id="schedule" className="py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {isLongWeekend ? "My Long Weekend Plan" : "My Weekend Plan"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isLongWeekend
              ? `Your perfect ${activeDays.length}-day weekend schedule. Make the most of your extended time off!`
              : "Your perfect weekend schedule. Organize activities by time slots and make the most of your days off."
            }
          </p>
          {isLongWeekend && (
            <div className="mt-4 flex justify-center">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                🎊 {activeDays.length}-Day Weekend
              </span>
            </div>
          )}
        </div>

        {onScheduleChange && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm max-w-4xl mx-auto">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Extend Your Weekend</h3>
                <p className="text-sm text-gray-600">Select additional days to create your perfect long weekend</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {(["friday", "saturday", "sunday", "monday"] as const).map((day) => {
                  const dayLabels = {
                    friday: { label: "Friday", emoji: "🎉", color: "border-purple-300 bg-purple-50" },
                    saturday: { label: "Saturday", emoji: "🌅", color: "border-blue-300 bg-blue-50" },
                    sunday: { label: "Sunday", emoji: "☀️", color: "border-yellow-300 bg-yellow-50" },
                    monday: { label: "Monday", emoji: "✨", color: "border-green-300 bg-green-50" }
                  }

                  const isActive = activeDays.includes(day)
                  const isCore = day === "saturday" || day === "sunday"

                  return (
                    <button
                      key={day}
                      onClick={() => !isCore && handleDayToggle(day)}
                      disabled={isCore}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${isActive
                        ? `${dayLabels[day].color} border-opacity-100`
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        } ${isCore ? "opacity-100" : "cursor-pointer"} ${isCore && !isActive ? "border-dashed" : ""
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{dayLabels[day].emoji}</span>
                        <span className="font-medium text-sm">{dayLabels[day].label}</span>
                        {isCore && (
                          <span className="text-xs text-gray-500">Core</span>
                        )}
                        {isActive && !isCore && (
                          <span className="text-xs bg-white/70 px-2 py-1 rounded">
                            {schedule[day] ? Object.values(schedule[day]!).flat().length : 0} activities
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

            </div>
          </div>
        )}
        {totalActivities > 0 && <div className="flex justify-end items-end py-6  ">
          <ClearData
            onClearData={clearAllData}
          />
        </div>}
        {totalActivities === 0 ? (
          <div className="space-y-8">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">Your weekend awaits!</h3>
              <p className="text-muted-foreground mb-6">Start by adding activities from the catalog above.</p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 font-medium">
                💡 You can drag activities directly to time slots below!
              </div>
            </div>

            <div className={`grid gap-8 ${activeDays.length === 2 ? 'md:grid-cols-2' :
              activeDays.length === 3 ? 'md:grid-cols-3' :
                activeDays.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
                  'md:grid-cols-2'
              }`}>
              {activeDays.map(day => (
                <DayColumn
                  key={day}
                  day={day}
                  schedule={schedule[day]!}
                  onRemoveActivity={onRemoveActivity}
                  onViewActivityDetails={onViewActivityDetails}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={`grid gap-8 ${activeDays.length === 2 ? 'md:grid-cols-2' :
            activeDays.length === 3 ? 'md:grid-cols-3' :
              activeDays.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
                'md:grid-cols-2'
            }`}>
            {activeDays.map(day => (
              <DayColumn
                key={day}
                day={day}
                schedule={schedule[day]!}
                onRemoveActivity={onRemoveActivity}
                onViewActivityDetails={onViewActivityDetails}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
