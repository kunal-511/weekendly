interface ScheduleNavigationProps {
  activeSection: "activities" | "schedule"
  onSectionChange: (section: "activities" | "schedule") => void
  totalPlannedActivities: number
}

export default function ScheduleNavigation({
  activeSection,
  onSectionChange,
  totalPlannedActivities,
}: ScheduleNavigationProps) {
  const handleSectionChange = (section: "activities" | "schedule") => {
    onSectionChange(section)
    
    setTimeout(() => {
      const element = document.getElementById("activities")
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  const handleHolidaysClick = () => {
    window.location.href = "/holidays"
  }

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => handleSectionChange("activities")}
              className={`px-3 py-2 sm:px-4 rounded-full font-medium transition-all whitespace-nowrap text-sm sm:text-base cursor-pointer ${
                activeSection === "activities"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              🎯 Activities
            </button>
            <button
              onClick={handleHolidaysClick}
              className="px-3 py-2 sm:px-4 rounded-full font-medium transition-all whitespace-nowrap text-sm sm:text-base text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              🏖️ Holidays
            </button>
          </div>

          {totalPlannedActivities > 0 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="hidden sm:inline">{totalPlannedActivities} activities planned</span>
              <span className="sm:hidden">{totalPlannedActivities} planned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
