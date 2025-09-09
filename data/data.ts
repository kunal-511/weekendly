import {Holiday } from "@/types/activity"
import { Calendar, Camera, Copy, FileText } from "lucide-react"

export const timeSlots = [
  {
    day: "saturday" as const,
    timeSlot: "morning" as const,
    label: "Saturday Morning",
    time: "8 AM - 12 PM",
    icon: "🌅",
    bg: "bg-yellow-50 hover:bg-yellow-100",
  },
  {
    day: "saturday" as const,
    timeSlot: "afternoon" as const,
    label: "Saturday Afternoon",
    time: "12 PM - 6 PM",
    icon: "☀️",
    bg: "bg-blue-50 hover:bg-blue-100",
  },
  {
    day: "saturday" as const,
    timeSlot: "evening" as const,
    label: "Saturday Evening",
    time: "6 PM - 11 PM",
    icon: "🌙",
    bg: "bg-purple-50 hover:bg-purple-100",
  },
  {
    day: "sunday" as const,
    timeSlot: "morning" as const,
    label: "Sunday Morning",
    time: "8 AM - 12 PM",
    icon: "🌅",
    bg: "bg-yellow-50 hover:bg-yellow-100",
  },
  {
    day: "sunday" as const,
    timeSlot: "afternoon" as const,
    label: "Sunday Afternoon",
    time: "12 PM - 6 PM",
    icon: "☀️",
    bg: "bg-blue-50 hover:bg-blue-100",
  },
  {
    day: "sunday" as const,
    timeSlot: "evening" as const,
    label: "Sunday Evening",
    time: "6 PM - 11 PM",
    icon: "🌙",
    bg: "bg-purple-50 hover:bg-purple-100",
  },
]

export const moodOptions = {
  energy: [
    { id: "high", label: "High Energy", emoji: "⚡" },
    { id: "medium", label: "Medium Energy", emoji: "🔋" },
    { id: "low", label: "Low Energy", emoji: "😴" },
  ],
  social: [
    { id: "group", label: "Group", emoji: "👥" },
    { id: "couple", label: "Couple", emoji: "👫" },
    { id: "solo", label: "Solo", emoji: "🙋" },
  ],
  vibes: [
    { id: "creative", label: "Creative", emoji: "🎨" },
    { id: "mental", label: "Mental", emoji: "🧠" },
    { id: "physical", label: "Physical", emoji: "💪" },
    { id: "nature", label: "Nature", emoji: "🍃" },
    { id: "indoor", label: "Indoor", emoji: "🏠" },
  ],
}

export const HOLIDAYS_2025: Holiday[] = [
  {
    id: 'gandhi-jayanti-2025',
    name: 'Gandhi Jayanti',
    date: '2025-10-02',
    type: 'national',
    description: 'Birth anniversary of Mahatma Gandhi'
  },
  {
    id: 'dussehra-2025',
    name: 'Dussehra',
    date: '2025-10-02',
    type: 'cultural',
    description: 'Victory of good over evil'
  },
  {
    id: 'diwali-2025',
    name: 'Diwali',
    date: '2025-10-20',
    type: 'cultural',
    description: 'Festival of lights'
  },
  {
    id: 'christmas-2025',
    name: 'Christmas Day',
    date: '2025-12-25',
    type: 'religious',
    description: 'Christian celebration of birth of Jesus Christ'
  }
]

export const HOLIDAYS_2026: Holiday[] = [
  {
    id: 'new-years-2026',
    name: 'New Year\'s Day',
    date: '2026-01-01',
    type: 'national',
    description: 'New Year celebration'
  },
  {
    id: 'republic-day-2026',
    name: 'Republic Day',
    date: '2026-01-26',
    type: 'national',
    description: 'Celebrates the adoption of Indian Constitution'
  },
  {
    id: 'holi-2026',
    name: 'Holi',
    date: '2026-03-04',
    type: 'cultural',
    description: 'Festival of colors and spring'
  },
  {
    id: 'good-friday-2026',
    name: 'Good Friday',
    date: '2026-04-03',
    type: 'religious',
    description: 'Christian holiday commemorating crucifixion of Jesus'
  },
  {
    id: 'eid-ul-fitr-2026',
    name: 'Eid ul-Fitr',
    date: '2026-03-20',
    type: 'religious',
    description: 'Festival marking end of Ramadan'
  },
  {
    id: 'independence-day-2026',
    name: 'Independence Day',
    date: '2026-08-15',
    type: 'national',
    description: 'Celebrates India\'s independence from British rule'
  },
  {
    id: 'janmashtami-2026',
    name: 'Krishna Janmashtami',
    date: '2026-09-04',
    type: 'religious',
    description: 'Birth of Lord Krishna'
  },
  {
    id: 'gandhi-jayanti-2026',
    name: 'Gandhi Jayanti',
    date: '2026-10-02',
    type: 'national',
    description: 'Birth anniversary of Mahatma Gandhi'
  },
  {
    id: 'dussehra-2026',
    name: 'Dussehra',
    date: '2026-10-11',
    type: 'cultural',
    description: 'Victory of good over evil'
  },
  {
    id: 'diwali-2026',
    name: 'Diwali',
    date: '2026-10-21',
    type: 'cultural',
    description: 'Festival of lights'
  },
  {
    id: 'christmas-2026',
    name: 'Christmas Day',
    date: '2026-12-25',
    type: 'religious',
    description: 'Christian celebration of birth of Jesus Christ'
  }
]



export const durationRanges = [
  { id: 'quick', label: 'Quick (< 2h)', emoji: '⚡', min: 0, max: 2 },
  { id: 'medium', label: 'Medium (2-4h)', emoji: '🕐', min: 2, max: 4 },
  { id: 'long', label: 'Long (4h+)', emoji: '📅', min: 4, max: 24 }
]

export const popularityFilters = [
  { id: 'trending', label: 'Trending', emoji: '🔥' },
  { id: 'popular', label: 'Popular', emoji: '⭐' },
  { id: 'new', label: 'New', emoji: '✨' }
]
export const formatOptions = [
  {
    id: 'png',
    name: 'PNG Image',
    description: 'High quality with transparency',
    icon: Camera,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200 hover:border-blue-300'
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Perfect for printing and archiving',
    icon: FileText,
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    borderColor: 'border-red-200 hover:border-red-300'
  },
  {
    id: 'ics',
    name: 'Calendar File',
    description: 'Import directly to your calendar app',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    borderColor: 'border-purple-200 hover:border-purple-300'
  },
  {
    id: 'text',
    name: 'Text Summary',
    description: 'Copy formatted text to clipboard',
    icon: Copy,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    borderColor: 'border-orange-200 hover:border-orange-300'
  }
]
