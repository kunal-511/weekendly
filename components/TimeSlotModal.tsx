"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Activity } from "@/types/activity"
import { timeSlots } from "@/data/data"

interface TimeSlotModalProps {
  isOpen: boolean
  onClose: () => void
  activity: Activity | null
  onAddToSchedule: (
    activityId: string,
    day: "saturday" | "sunday",
    timeSlot: "morning" | "afternoon" | "evening",
  ) => void
}

export default function TimeSlotModal({ isOpen, onClose, activity, onAddToSchedule }: TimeSlotModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<{
    day: "saturday" | "sunday"
    timeSlot: "morning" | "afternoon" | "evening"
  } | null>(null)


  const handleAddActivity = () => {
    if (activity && selectedSlot) {
      onAddToSchedule(activity.id, selectedSlot.day, selectedSlot.timeSlot)
      onClose()
      setSelectedSlot(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Add to Weekend</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-center text-muted-foreground">Choose when to do this activity:</p>

          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <button
                key={`${slot.day}-${slot.timeSlot}`}
                onClick={() => setSelectedSlot(slot)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedSlot?.day === slot.day && selectedSlot?.timeSlot === slot.timeSlot
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${slot.bg}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{slot.icon}</span>
                  <div>
                    <div className="font-medium">{slot.label}</div>
                    <div className="text-sm text-muted-foreground">{slot.time}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleAddActivity} disabled={!selectedSlot} className="flex-1">
              Add Activity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
