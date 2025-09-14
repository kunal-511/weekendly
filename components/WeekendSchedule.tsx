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
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {isLongWeekend ? "📅 Long Weekend Plan" : "📅 Weekend Plan"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            {isLongWeekend
              ? `Your ${activeDays.length}-day schedule`
              : "Organize activities by time slots"
            }
          </p>
          {isLongWeekend && (
            <div className="mt-3 flex justify-center">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                🎊 {activeDays.length}-Day Weekend
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">{onScheduleChange && (
          <div className="mb-6">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-center mb-3">
                <h3 className="text-base font-semibold text-gray-900 mb-1">🎯 Extend Your Weekend</h3>
                <p className="text-xs text-gray-600">Select additional days for your long weekend</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
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
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-xs ${isActive
                        ? `${dayLabels[day].color} border-opacity-100`
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        } ${isCore ? "opacity-100" : "cursor-pointer"} ${isCore && !isActive ? "border-dashed" : ""
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{dayLabels[day].emoji}</span>
                        <span className="font-medium text-xs">{dayLabels[day].label}</span>
                        {isCore && (
                          <span className="text-xs text-gray-500">Core</span>
                        )}
                        {isActive && !isCore && (
                          <span className="text-xs bg-white/70 px-1 py-0.5 rounded">
                            {schedule[day] ? Object.values(schedule[day]!).flat().length : 0}
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

        {/* Clear Data Button */}
        {totalActivities > 0 && (
          <div className="flex justify-end mb-4">
            <ClearData onClearData={clearAllData} />
          </div>
        )}

        {totalActivities === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Your weekend awaits!</h3>
            <p className="text-sm text-gray-600 mb-4">Start by adding activities from the left panel.</p>
            <div className="inline-flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 font-medium">
              💡 Drag activities to time slots or use the + button
            </div>
          </div>
        ) : null}

        {/* Day Columns Grid */}
        <div className={`grid gap-4 ${
          activeDays.length === 1 ? 'grid-cols-1' :
          activeDays.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
          activeDays.length === 3 ? 'grid-cols-1 lg:grid-cols-3' :
          activeDays.length === 4 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4' :
          'grid-cols-1 lg:grid-cols-2'
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
    </div>
  )
}
