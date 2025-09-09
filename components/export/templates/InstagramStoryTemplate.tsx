import type { WeekendSchedule } from "@/types/activity"
import type { ExportTemplate, WeatherData } from "@/types/export"


interface InstagramStoryTemplateProps {
  schedule: WeekendSchedule
  template: ExportTemplate
  weather?: WeatherData
  customMessage?: string

}

export function InstagramStoryTemplate({
  schedule,
  template,
  weather,
  customMessage,

}: InstagramStoryTemplateProps) {

  return (
    <div className="w-full h-full flex flex-col relative">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, ${template.accentColor}40 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${template.accentColor}30 0%, transparent 50%)
          `
        }}
      />

      <div className="relative z-10 text-center pt-16 pb-8">
        <h1 className="text-6xl font-black mb-4" style={{ color: template.textColor }}>
          MY WEEKEND VIBES
        </h1>
        {customMessage && (
          <p className="text-2xl opacity-90 px-8" style={{ color: template.textColor }}>
            {customMessage}
          </p>
        )}
      </div>

      <div className="flex-1 px-12">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">🌙</div>
            <h2 className="text-4xl font-bold" style={{ color: template.textColor }}>
              Saturday
            </h2>
            {weather && (
              <div className="flex items-center gap-2 text-2xl opacity-80">
                <span>{weather.saturday.icon}</span>
                <span>{weather.saturday.temperature}°C</span>
              </div>
            )}
          </div>
          
          <div 
            className="h-1 mb-8 rounded-full"
            style={{ backgroundColor: template.accentColor }}
          />

          <div className="space-y-4">
            {Object.entries(schedule.saturday).map(([timeSlot, activities]) => {
              if (activities.length === 0) return null
              
              const timeEmoji = timeSlot === 'morning' ? '☀️' : timeSlot === 'afternoon' ? '🌅' : '🌙'
              const timeLabel = timeSlot === 'morning' ? '10 AM' : timeSlot === 'afternoon' ? '2 PM' : '7 PM'
              
              return (
                <div key={timeSlot}>
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 text-2xl mb-3">
                      <span>{timeEmoji}</span>
                      <span className="font-semibold">{timeLabel}</span>
                      <span className="text-3xl">{activity.icon}</span>
                      <span>{activity.title}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">🔥</div>
            <h2 className="text-4xl font-bold" style={{ color: template.textColor }}>
              Sunday
            </h2>
            {weather && (
              <div className="flex items-center gap-2 text-2xl opacity-80">
                <span>{weather.sunday.icon}</span>
                <span>{weather.sunday.temperature}°C</span>
              </div>
            )}
          </div>
          
          <div 
            className="h-1 mb-8 rounded-full"
            style={{ backgroundColor: template.accentColor }}
          />

          <div className="space-y-4">
            {Object.entries(schedule.sunday).map(([timeSlot, activities]) => {
              if (activities.length === 0) return null
              
              const timeEmoji = timeSlot === 'morning' ? '⚡' : timeSlot === 'afternoon' ? '🍕' : '🎮'
              const timeLabel = timeSlot === 'morning' ? '9 AM' : timeSlot === 'afternoon' ? '1 PM' : '6 PM'
              
              return (
                <div key={timeSlot}>
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 text-2xl mb-3">
                      <span>{timeEmoji}</span>
                      <span className="font-semibold">{timeLabel}</span>
                      <span className="text-3xl">{activity.icon}</span>
                      <span>{activity.title}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center pb-16">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div>
            <p className="text-2xl font-bold" style={{ color: template.accentColor }}>
              Made with Weekendly ✨
            </p>
            <p className="text-lg opacity-75" style={{ color: template.textColor }}>
              Plan your perfect weekend
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-20 right-12 text-6xl opacity-20 rotate-12">✨</div>
      <div className="absolute bottom-32 left-8 text-4xl opacity-15 -rotate-12">🌟</div>
      <div className="absolute top-1/2 right-8 text-5xl opacity-10 rotate-45">💫</div>
    </div>
  )
}