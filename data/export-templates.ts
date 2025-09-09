import type { ExportTemplate } from "@/types/export"

export const exportTemplates: ExportTemplate[] = [
  // Instagram Story Style
  {
    id: "instagram-story",
    name: "Instagram Story",
    description: "Perfect for sharing on Instagram Stories",
    type: "instagram",
    aspectRatio: "9:16",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
    accentColor: "#ffd700",
    font: "Inter",
    layout: "vibrant"
  },
  {
    id: "instagram-post",
    name: "Instagram Post",
    description: "Square format for Instagram posts",
    type: "instagram",
    aspectRatio: "1:1",
    backgroundColor: "linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
    textColor: "#2d3748",
    accentColor: "#e53e3e",
    font: "Inter",
    layout: "playful"
  },


  // Calendar Poster Style
  {
    id: "calendar-classic",
    name: "Calendar Classic",
    description: "Traditional calendar layout",
    type: "calendar",
    aspectRatio: "4:3",
    backgroundColor: "#ffffff",
    textColor: "#2d3748",
    accentColor: "#3182ce",
    font: "Inter",
    layout: "minimal"
  },


  // Print Formats
  {
    id: "print-poster",
    name: "Print Poster",
    description: "High-quality print format",
    type: "print",
    aspectRatio: "3:4",
    backgroundColor: "#ffffff",
    textColor: "#1a202c",
    accentColor: "#e53e3e",
    font: "Inter",
    layout: "elegant"
  },
  {
    id: "print-planner",
    name: "Planner Style",
    description: "Planner and journal style",
    type: "print",
    aspectRatio: "8.5:11",
    backgroundColor: "#fffdf7",
    textColor: "#2d3748",
    accentColor: "#d69e2e",
    font: "Inter",
    layout: "minimal"
  }
]

export const socialPlatforms = {
  instagram: {
    storySize: { width: 1080, height: 1920 },
    postSize: { width: 1080, height: 1080 },
    hashtags: ["#weekendplans", "#weekendvibes", "#weekendgoals", "#weekendly"]
  },
  twitter: {
    imageSize: { width: 1200, height: 675 },
    hashtags: ["#weekendplans", "#weekend", "#plans"]
  },
  facebook: {
    imageSize: { width: 1200, height: 630 },
    hashtags: []
  },
  
}