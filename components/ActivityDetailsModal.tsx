"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Users, Zap, Heart, Edit3, Save, X } from "lucide-react"
import type { Activity } from "@/types/activity"
import { cn } from "@/lib/utils"

interface ActivityDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  activity: Activity | null
  activityNotes: string
  onNotesChange: (notes: string) => void
  day?: "friday" | "saturday" | "sunday" | "monday"
  timeSlot?: "morning" | "afternoon" | "evening"
}

export default function ActivityDetailsModal({
  isOpen,
  onClose,
  activity,
  activityNotes,
  onNotesChange,
  day,
  timeSlot
}: ActivityDetailsModalProps) {
  const [notes, setNotes] = useState("")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState("")

  useEffect(() => {
    setNotes(activityNotes)
    setTempNotes(activityNotes)
  }, [activityNotes, isOpen])

  if (!activity) return null

  const handleSaveNotes = () => {
    setNotes(tempNotes)
    onNotesChange(tempNotes)
    setIsEditingNotes(false)
  }

  const handleCancelEdit = () => {
    setTempNotes(notes)
    setIsEditingNotes(false)
  }

  const getMoodEmojis = (activity: Activity) => {
    const energyEmoji = activity.mood.energy === "high" ? "⚡" : activity.mood.energy === "medium" ? "🔋" : "😴"
    const socialEmoji = activity.mood.social === "group" ? "👥" : activity.mood.social === "couple" ? "👫" : "🙋"
    return { energyEmoji, socialEmoji }
  }

  const getVibeEmojis = (vibes: string[]) => {
    return vibes.map((vibe) => {
      switch (vibe) {
        case "creative": return "🎨"
        case "mental": return "🧠"
        case "physical": return "💪"
        case "nature": return "🍃"
        case "indoor": return "🏠"
        default: return "✨"
      }
    })
  }

  const getTimeSlotLabel = (day?: string, timeSlot?: string) => {
    if (!day || !timeSlot) return ""
    
    const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
    const timeRanges = {
      morning: "8:00 AM - 12:00 PM",
      afternoon: "12:00 PM - 6:00 PM", 
      evening: "6:00 PM - 11:00 PM"
    }
    
    return `${dayLabel} ${timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)} (${timeRanges[timeSlot as keyof typeof timeRanges]})`
  }

  const { energyEmoji, socialEmoji } = getMoodEmojis(activity)
  const vibeEmojis = getVibeEmojis(activity.mood.vibes)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-4xl">{activity.icon}</span>
            <div className="flex-1">
              <div>{activity.title}</div>
              {day && timeSlot && (
                <div className="text-sm font-normal text-gray-600 mt-1">
                  📅 {getTimeSlotLabel(day, timeSlot)}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge 
              className={cn(
                "text-white shadow-sm",
                activity.category.color
              )}
            >
              <span className="mr-1">{activity.category.icon}</span>
              {activity.category.name}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              About This Activity
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {activity.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Duration</h4>
              </div>
              <p className="text-blue-800 font-medium">{activity.duration} hour{activity.duration !== 1 ? 's' : ''}</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-900">Energy Level</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{energyEmoji}</span>
                <span className="text-yellow-800 font-medium capitalize">{activity.mood.energy}</span>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Social Setting</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{socialEmoji}</span>
                <span className="text-green-800 font-medium capitalize">{activity.mood.social}</span>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Vibes</h4>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {activity.mood.vibes.map((vibe, index) => (
                  <div key={vibe} className="flex items-center gap-1">
                    <span className="text-lg">{vibeEmojis[index]}</span>
                    <span className="text-purple-800 text-sm font-medium capitalize">{vibe}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                Personal Notes
              </h3>
              {!isEditingNotes && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  {notes ? 'Edit' : 'Add Notes'}
                </Button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Add your personal notes, reminders, or thoughts about this activity..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveNotes}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Notes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-[100px]">
                {notes ? (
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {notes}
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-center py-6">
                    No notes added yet. Click &quot;Add&quot; Notes to add your thoughts, reminders, or plans for this activity.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
