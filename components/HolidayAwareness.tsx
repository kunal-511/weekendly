"use client"

import { useState, useEffect } from "react"
import { HolidayService } from "@/utils/holiday-service"
import type { Holiday, LongWeekend } from "@/types/activity"
import { format, parseISO, differenceInDays } from "date-fns"
import { Loader } from "./Loader"

interface HolidayAwarenessProps {
  onSelectLongWeekend?: (longWeekend: LongWeekend) => void
  onPlanHoliday?: (holiday: Holiday) => void
}

export function HolidayAwareness({ onSelectLongWeekend, onPlanHoliday }: HolidayAwarenessProps) {
  const [upcomingLongWeekends, setUpcomingLongWeekends] = useState<LongWeekend[]>([])
  const [nextHoliday, setNextHoliday] = useState<Holiday | null>(null)
  const [holidaysThisMonth, setHolidaysThisMonth] = useState<Holiday[]>([])
  const [currentWeekendExtension, setCurrentWeekendExtension] = useState<{ canExtend: boolean; suggestion?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<"overview" | "holidays" | "longweekends">("overview")

  useEffect(() => {
    loadHolidayData()
  }, [])

  const loadHolidayData = async () => {
    setLoading(true)
    try {
      const longWeekends = HolidayService.getUpcomingLongWeekends(6)
      const holiday = HolidayService.getNextHoliday()
      const monthlyHolidays = HolidayService.getHolidaysThisMonth()
      const weekendExtension = HolidayService.canExtendCurrentWeekend()

      setUpcomingLongWeekends(longWeekends)
      setNextHoliday(holiday)
      setHolidaysThisMonth(monthlyHolidays)
      setCurrentWeekendExtension(weekendExtension)
    } catch (error) {
      console.error('Error loading holiday data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntil = (dateString: string) => {
    const targetDate = parseISO(dateString)
    const today = new Date()
    return differenceInDays(targetDate, today)
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate)
    const end = parseISO(endDate)

    if (start.getMonth() === end.getMonth()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
    } else {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
  }

  const getHolidayEmoji = (holiday: Holiday) => {
    const emojiMap: Record<string, string> = {
      'Republic Day': '🇮🇳',
      'Independence Day': '🇮🇳',
      'Gandhi Jayanti': '🕊️',
      'Holi': '🎨',
      'Diwali': '🪔',
      'Dussehra': '🏹',
      'Krishna Janmashtami': '🦚',
      'Eid ul-Fitr': '🌙',
      'Christmas Day': '🎄',
      'Good Friday': '✝️',
      'New Year\'s Day': '🎊'
    }
    return emojiMap[holiday.name] || '🎉'
  }

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'national': 'bg-orange-100 text-orange-800',
      'cultural': 'bg-purple-100 text-purple-800',
      'religious': 'bg-blue-100 text-blue-800'
    }
    return colorMap[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <>
        <Loader />
        <p className="ml-2 text-gray-600">Loading holiday insights...</p>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Holiday Calendar</h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedView("overview")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedView === "overview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView("holidays")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedView === "holidays"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              All Holidays
            </button>
            <button
              onClick={() => setSelectedView("longweekends")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedView === "longweekends"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Long Weekends
            </button>
          </div>
        </div>
      </div>

      {selectedView === "overview" && currentWeekendExtension?.canExtend && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💡</span>
            <h3 className="font-semibold text-green-900">Weekend Extension Opportunity</h3>
          </div>
          <p className="text-green-800 text-sm mb-3">{currentWeekendExtension.suggestion}</p>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
            Plan Extended Weekend
          </button>
        </div>
      )}

      {selectedView === "overview" && nextHoliday && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getHolidayEmoji(nextHoliday)}</span>
              <h3 className="font-semibold text-blue-900">Next Holiday</h3>
            </div>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {getDaysUntil(nextHoliday.date)} days away
            </span>
          </div>
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-blue-900">{nextHoliday.name}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(nextHoliday.type)}`}>
                {nextHoliday.type}
              </span>
            </div>
            <p className="text-sm text-blue-700">
              {format(parseISO(nextHoliday.date), 'EEEE, MMMM d, yyyy')}
            </p>
            {nextHoliday.description && (
              <p className="text-sm text-blue-600 mt-1">{nextHoliday.description}</p>
            )}
          </div>
          {onPlanHoliday && (
            <button
              onClick={() => onPlanHoliday(nextHoliday)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Plan Holiday Weekend
            </button>
          )}
        </div>
      )}

      {(selectedView === "overview" || selectedView === "longweekends") && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🏖️ Upcoming Long Weekends</h3>
            <span className="text-sm text-gray-500">{upcomingLongWeekends.length} opportunities</span>
          </div>

          {upcomingLongWeekends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No upcoming long weekends found in the next 6 months.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingLongWeekends.slice(0, selectedView === "longweekends" ? 10 : 3).map((longWeekend) => (
                <div
                  key={longWeekend.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer"
                  onClick={() => onSelectLongWeekend?.(longWeekend)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{longWeekend.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {longWeekend.daysCount} days
                      </span>
                      <span className="text-sm text-gray-500">
                        {getDaysUntil(longWeekend.startDate)} days away
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {formatDateRange(longWeekend.startDate, longWeekend.endDate)}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {longWeekend.days.map((day) => (
                      <span
                        key={day}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize"
                      >
                        {day}
                      </span>
                    ))}
                  </div>

                  {longWeekend.holiday && (
                    <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
                      {getHolidayEmoji(longWeekend.holiday)} Includes {longWeekend.holiday.name}
                    </div>
                  )}
                </div>
              ))}

              {selectedView === "overview" && upcomingLongWeekends.length > 3 && (
                <button
                  onClick={() => setSelectedView("longweekends")}
                  className="w-full py-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                >
                  View all {upcomingLongWeekends.length} long weekends →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {selectedView === "holidays" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎉 All Holidays</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HolidayService.getHolidays(new Date(), new Date(new Date().getFullYear() + 1, 11, 31)).slice(0, 12).map((holiday) => (
              <div
                key={holiday.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onPlanHoliday?.(holiday)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getHolidayEmoji(holiday)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{holiday.name}</h4>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(holiday.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {getDaysUntil(holiday.date) < 0 ? 'Past' :
                        getDaysUntil(holiday.date) === 0 ? 'Today' :
                          getDaysUntil(holiday.date) === 1 ? 'Tomorrow' :
                            `${getDaysUntil(holiday.date)} days`}
                    </span>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getTypeColor(holiday.type)}`}>
                      {holiday.type}
                    </div>
                  </div>
                </div>
                {holiday.description && (
                  <p className="text-sm text-gray-600 mt-2">{holiday.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === "overview" && holidaysThisMonth.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📅 This Month&apos;s Holidays</h3>
            <button
              onClick={() => setSelectedView("holidays")}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {holidaysThisMonth.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onPlanHoliday?.(holiday)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getHolidayEmoji(holiday)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{holiday.name}</h4>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(holiday.date), 'EEEE, MMMM d')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">
                    {getDaysUntil(holiday.date) === 0 ? 'Today' :
                      getDaysUntil(holiday.date) === 1 ? 'Tomorrow' :
                        `${getDaysUntil(holiday.date)} days`}
                  </span>
                  <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getTypeColor(holiday.type)}`}>
                    {holiday.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default HolidayAwareness
