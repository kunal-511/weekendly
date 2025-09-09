"use client"

import { useMemo } from "react"
import { useTheme } from "@/contexts/theme-context"
import { activities } from "@/data/actvity"
import type { WeekendSchedule } from "@/types/activity"
import { cn } from "@/lib/utils"

interface SmartRecommendationsProps {
  schedule: WeekendSchedule
  onAddActivity: (activityId: string) => void
}

export default function SmartRecommendations({ schedule, onAddActivity }: SmartRecommendationsProps) {
  const { currentTheme } = useTheme()

  const insights = useMemo(() => {
    const scheduledActivities = [...Object.values(schedule.saturday).flat(), ...Object.values(schedule.sunday).flat()]

    if (scheduledActivities.length === 0) {
      return null
    }

    const energyDistribution = { high: 0, medium: 0, low: 0 }
    const socialBalance = { group: 0, couple: 0, solo: 0 }
    const vibesCount: Record<string, number> = {}

    scheduledActivities.forEach((activity) => {
      energyDistribution[activity.mood.energy]++
      socialBalance[activity.mood.social]++
      activity.mood.vibes.forEach((vibe) => {
        vibesCount[vibe] = (vibesCount[vibe] || 0) + 1
      })
    })

    const recommendations = []

    const totalActivities = scheduledActivities.length
    const highEnergyRatio = energyDistribution.high / totalActivities
    const lowEnergyRatio = energyDistribution.low / totalActivities

    if (highEnergyRatio > 0.7) {
      recommendations.push({
        type: "balance",
        title: "Add some chill time",
        description: "Your weekend is very high-energy. Consider adding relaxing activities.",
        activities: activities.filter((a) => a.mood.energy === "low").slice(0, 3),
      })
    } else if (lowEnergyRatio > 0.7) {
      recommendations.push({
        type: "balance",
        title: "Boost your energy",
        description: "Your weekend looks quite relaxed. Add some energizing activities!",
        activities: activities.filter((a) => a.mood.energy === "high").slice(0, 3),
      })
    }

    const soloRatio = socialBalance.solo / totalActivities
    if (soloRatio > 0.6) {
      recommendations.push({
        type: "social",
        title: "Connect with others",
        description: "You have lots of solo time. Consider adding social activities.",
        activities: activities.filter((a) => a.mood.social === "group").slice(0, 3),
      })
    }

    const themeActivities = activities.filter((a) => currentTheme.recommendedActivities.includes(a.id)).slice(0, 3)

    if (themeActivities.length > 0) {
      recommendations.push({
        type: "theme",
        title: `Perfect for ${currentTheme.name}`,
        description: `Based on your ${currentTheme.description.toLowerCase()} theme, try these:`,
        activities: themeActivities,
      })
    }

    return { recommendations, energyDistribution, socialBalance, vibesCount }
  }, [schedule, currentTheme])

  if (!insights || insights.recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">💡</span>
        <h3 className="text-lg font-semibold text-gray-800">Smart Suggestions</h3>
      </div>

      {insights.recommendations.map((rec, index) => (
        <div key={index} className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-800">{rec.title}</h4>
            <p className="text-sm text-gray-600">{rec.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {rec.activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => onAddActivity(activity.id)}
                className={cn(
                  "p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50",
                  "transition-all duration-200 hover:scale-105 hover:shadow-md",
                  "text-left space-y-1",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activity.icon}</span>
                  <span className="font-medium text-sm text-gray-800">{activity.title}</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-xs">
                    {activity.mood.energy === "high" ? "⚡" : activity.mood.energy === "medium" ? "🔋" : "😴"}
                  </span>
                  <span className="text-xs">
                    {activity.mood.social === "group" ? "👥" : activity.mood.social === "couple" ? "👫" : "🙋"}
                  </span>
                  {activity.mood.vibes.slice(0, 2).map((vibe, i) => (
                    <span key={i} className="text-xs">
                      {vibe === "creative"
                        ? "🎨"
                        : vibe === "mental"
                          ? "🧠"
                          : vibe === "physical"
                            ? "💪"
                            : vibe === "nature"
                              ? "🍃"
                              : "🏠"}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
