import type { Theme } from "@/types/activity"

export const themes: Theme[] = [
  {
    id: "chill",
    name: "Chill Weekend",
    description: "Recharge",
    colors: {
      primary: "#6366F1",
      secondary: "#64748B",
      accent: "#059669",
      background: "#F8FAFC",
      foreground: "#1E293B",
      muted: "#F1F5F9",
      mutedForeground: "#64748B",
    },
    recommendedActivities: ["27", "28", "29", "30", "26", "18", "23"],
    moodEmphasis: ["low", "medium"],
    backgroundPattern:
      "radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)",
  },
  {
    id: "adventure",
    name: "Adventure Weekend",
    description: "Explore",
    colors: {
      primary: "#DC2626",
      secondary: "#EA580C",
      accent: "#D97706",
      background: "#FEF2F2",
      foreground: "#7F1D1D",
      muted: "#FEE2E2",
      mutedForeground: "#991B1B",
    },
    recommendedActivities: ["13", "17", "20", "16", "3", "8", "24"],
    moodEmphasis: ["high"],
    backgroundPattern:
      "linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(234, 88, 12, 0.1) 50%, rgba(217, 119, 6, 0.1) 100%)",
  },
  {
    id: "social",
    name: "Social Weekend",
    description: "Connect",
    colors: {
      primary: "#EC4899",
      secondary: "#8B5CF6",
      accent: "#10B981",
      background: "#FDF2F8",
      foreground: "#831843",
      muted: "#FCE7F3",
      mutedForeground: "#BE185D",
    },
    recommendedActivities: ["31", "32", "5", "12", "9", "33", "34"],
    moodEmphasis: ["medium", "high"],
    backgroundPattern:
      "radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
  },
]
