import type { WeekendSchedule } from "@/types/activity"
import type { ExportTemplate, WeatherData } from "@/types/export"


interface CalendarPosterTemplateProps {
  schedule: WeekendSchedule
  template: ExportTemplate
  weather?: WeatherData
  customMessage?: string

}

export function CalendarPosterTemplate({
  schedule,
  template,
  weather,
  customMessage,

}: CalendarPosterTemplateProps) {
  const now = new Date()
  const nextSaturday = new Date(now)
  nextSaturday.setDate(now.getDate() + (6 - now.getDay()))
  
  const nextSunday = new Date(nextSaturday)
  nextSunday.setDate(nextSaturday.getDate() + 1)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="w-full h-full flex flex-col relative">

      <div className="relative z-10 text-center py-8">
        <h1 
          className="text-5xl font-bold mb-4"
          style={{ color: template.textColor }}
        >
          Weekend Calendar
        </h1>
        {customMessage && (
          <p className="text-xl max-w-2xl mx-auto mb-4" style={{ color: template.textColor }}>
            {customMessage}
          </p>
        )}
        <div 
          className="w-24 h-1 mx-auto rounded-full"
          style={{ backgroundColor: template.accentColor }}
        />
      </div>

      <div className="flex-1 px-8 py-4">
        <div className="grid grid-cols-2 gap-8 h-full">
          <div className="border-2 rounded-2xl p-6" style={{ borderColor: template.accentColor }}>
            <div className="text-center mb-6">
              <div 
                className="inline-block px-4 py-2 rounded-full text-white font-semibold text-lg"
                style={{ backgroundColor: template.accentColor }}
              >
                SAT
              </div>
              <h2 className="text-2xl font-bold mt-2" style={{ color: template.textColor }}>
                {formatDate(nextSaturday).split(',')[1].trim()}
              </h2>
              {weather && (
                <div className="flex items-center justify-center gap-2 mt-2 text-lg">
                  <span>{weather.saturday.icon}</span>
                  <span style={{ color: template.textColor }}>
                    {weather.saturday.temperature}°C
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(schedule.saturday).map(([timeSlot, activities]) => {
                if (activities.length === 0) return null
                
                const timeLabels = {
                  morning: '9:00 AM',
                  afternoon: '2:00 PM', 
                  evening: '7:00 PM'
                }
                
                return (
                  <div key={timeSlot} className="space-y-2">
                    <div 
                      className="text-sm font-semibold px-3 py-1 rounded-full inline-block"
                      style={{ 
                        backgroundColor: `${template.accentColor}20`,
                        color: template.textColor 
                      }}
                    >
                      {timeLabels[timeSlot as keyof typeof timeLabels]}
                    </div>
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 ml-2">
                        <span className="text-2xl">{activity.icon}</span>
                        <div>
                          <div className="font-medium" style={{ color: template.textColor }}>
                            {activity.title}
                          </div>
                          <div className="text-sm opacity-70" style={{ color: template.textColor }}>
                            {activity.duration}h • {activity.category.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-2 rounded-2xl p-6" style={{ borderColor: template.accentColor }}>
            <div className="text-center mb-6">
              <div 
                className="inline-block px-4 py-2 rounded-full text-white font-semibold text-lg"
                style={{ backgroundColor: template.accentColor }}
              >
                SUN
              </div>
              <h2 className="text-2xl font-bold mt-2" style={{ color: template.textColor }}>
                {formatDate(nextSunday).split(',')[1].trim()}
              </h2>
              {weather && (
                <div className="flex items-center justify-center gap-2 mt-2 text-lg">
                  <span>{weather.sunday.icon}</span>
                  <span style={{ color: template.textColor }}>
                    {weather.sunday.temperature}°C
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(schedule.sunday).map(([timeSlot, activities]) => {
                if (activities.length === 0) return null
                
                const timeLabels = {
                  morning: '9:00 AM',
                  afternoon: '2:00 PM',
                  evening: '7:00 PM'
                }
                
                return (
                  <div key={timeSlot} className="space-y-2">
                    <div 
                      className="text-sm font-semibold px-3 py-1 rounded-full inline-block"
                      style={{ 
                        backgroundColor: `${template.accentColor}20`,
                        color: template.textColor 
                      }}
                    >
                      {timeLabels[timeSlot as keyof typeof timeLabels]}
                    </div>
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 ml-2">
                        <span className="text-2xl">{activity.icon}</span>
                        <div>
                          <div className="font-medium" style={{ color: template.textColor }}>
                            {activity.title}
                          </div>
                          <div className="text-sm opacity-70" style={{ color: template.textColor }}>
                            {activity.duration}h • {activity.category.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center py-6">
        <div className="flex items-center justify-center gap-4">
        
          <div>
            <p className="text-lg font-bold" style={{ color: template.accentColor }}>
              Made with Weekendly ✨
            </p>
            <p className="text-sm opacity-75" style={{ color: template.textColor }}>
              Plan your perfect weekend at weekendly.app
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}