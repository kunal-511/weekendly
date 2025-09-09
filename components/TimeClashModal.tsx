"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertTriangle, ArrowRight, Calendar, CheckCircle2 } from "lucide-react"
import { TimeClashDetector, type TimeClash, TIME_SLOTS } from "@/utils/time-clash-detection"
import type { Activity, WeekendSchedule } from "@/types/activity"
import { cn } from "@/lib/utils"

interface TimeClashModalProps {
  isOpen: boolean
  onClose: () => void
  clash: TimeClash | null
  activity: Activity | null
  schedule: WeekendSchedule
  onConfirm: () => void
  onSelectAlternative?: (day: "friday" | "saturday" | "sunday" | "monday", timeSlot: "morning" | "afternoon" | "evening") => void
}

export default function TimeClashModal({
  isOpen,
  onClose,
  clash,
  activity,
  schedule,
  onConfirm,
  onSelectAlternative
}: TimeClashModalProps) {
  const [selectedAlternative, setSelectedAlternative] = useState<{
    day: "friday" | "saturday" | "sunday" | "monday"
    timeSlot: "morning" | "afternoon" | "evening"
  } | null>(null)

  if (!clash || !activity) return null

  const slotInfo = TIME_SLOTS[clash.timeSlot]
  const alternatives = TimeClashDetector.suggestAlternativeSlots(
    schedule, 
    activity, 
    clash.day, 
    clash.timeSlot
  )

  const handleConfirmOverride = () => {
    onConfirm()
    onClose()
  }

  const handleSelectAlternative = () => {
    if (selectedAlternative && onSelectAlternative) {
      onSelectAlternative(selectedAlternative.day, selectedAlternative.timeSlot)
      onClose()
    }
  }

  const formatDayTimeSlot = (day: string, timeSlot: string) => {
    const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
    const timeLabel = timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)
    return `${dayLabel} ${timeLabel}`
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage <= 50) return "text-green-600 bg-green-100"
    if (percentage <= 80) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Time Conflict Detected
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="border-orange-200 bg-orange-50">
            <Clock className="w-5 h-5 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <p className="font-medium">
                  &ldquo;{activity.title}&rdquo; ({activity.duration}h) won&apos;t fit in {formatDayTimeSlot(clash.day, clash.timeSlot)}
                </p>
                <div className="text-sm space-y-1">
                  <div>• Time slot: {slotInfo.label} ({slotInfo.totalHours}h total)</div>
                  <div>• Currently used: {clash.currentDuration}h</div>
                  <div>• Available: {clash.availableHours}h</div>
                  <div>• Needed: {clash.activityDuration}h</div>
                  <div className="font-medium text-orange-900">
                    • Overflow: {clash.overflowHours}h
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {clash.existingActivities.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Current Activities in {formatDayTimeSlot(clash.day, clash.timeSlot)}
              </h4>
              <div className="space-y-2">
                {clash.existingActivities.map((existingActivity, index) => (
                  <div
                    key={`${existingActivity.id}-${index}`}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{existingActivity.icon}</span>
                      <span className="font-medium">{existingActivity.title}</span>
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {existingActivity.duration}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alternatives.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Suggested Alternative Time Slots
              </h4>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {alternatives.map((alt) => {
                  const utilization = TimeClashDetector.getTimeSlotUtilization(
                    schedule, 
                    alt.day, 
                    alt.timeSlot
                  )
                  const isSelected = selectedAlternative?.day === alt.day && 
                                   selectedAlternative?.timeSlot === alt.timeSlot

                  return (
                    <button
                      key={`${alt.day}-${alt.timeSlot}`}
                      onClick={() => setSelectedAlternative({ day: alt.day, timeSlot: alt.timeSlot })}
                      className={cn(
                        "p-3 border-2 rounded-lg text-left transition-all hover:shadow-sm",
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          {formatDayTimeSlot(alt.day, alt.timeSlot)}
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {alt.slotInfo.label}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">
                          {alt.availableHours}h available
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          getUtilizationColor(utilization)
                        )}>
                          {utilization.toFixed(0)}% used
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {alternatives.length === 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                No alternative time slots have enough space for this {activity.duration}h activity.
                You can still add it if you&apos;re flexible with timing.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 order-3 sm:order-1"
            >
              Cancel
            </Button>
            
            {alternatives.length > 0 && (
              <Button
                onClick={handleSelectAlternative}
                disabled={!selectedAlternative}
                className="flex-1 order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
              >
                {selectedAlternative ? (
                  <>
                    Move to {formatDayTimeSlot(selectedAlternative.day, selectedAlternative.timeSlot)}
                  </>
                ) : (
                  'Select Alternative'
                )}
              </Button>
            )}
            
            <Button
              onClick={handleConfirmOverride}
              variant="destructive"
              className="flex-1 order-2 sm:order-3"
            >
              Add Anyway (I&apos;ll Manage)
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
