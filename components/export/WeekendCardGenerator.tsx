"use client"

import { forwardRef } from "react"
import type { WeekendSchedule } from "@/types/activity"
import type { ExportTemplate, WeatherData } from "@/types/export"
import { InstagramStoryTemplate } from "./templates/InstagramStoryTemplate"
import { CalendarPosterTemplate } from "./templates/CalendarPosterTemplate"

interface WeekendCardGeneratorProps {
  schedule: WeekendSchedule
  template: ExportTemplate
  weather?: WeatherData
  customMessage?: string

}

export const WeekendCardGenerator = forwardRef<HTMLDivElement, WeekendCardGeneratorProps>(
  ({ schedule, template, weather, customMessage}, ref) => {
    const renderTemplate = () => {
      switch (template.id) {
        case 'instagram-story':
        case 'instagram-post':
          return (
            <InstagramStoryTemplate
              schedule={schedule}
              template={template}
              weather={weather}
              customMessage={customMessage}
            />
          )
        
        case 'calendar-classic':
          return (
            <CalendarPosterTemplate
              schedule={schedule}
              template={template}
              weather={weather}
              customMessage={customMessage}

            />
          )
        
        default:
          return (
            <InstagramStoryTemplate
              schedule={schedule}
              template={template}
              weather={weather}
              customMessage={customMessage}
            />
          )
      }
    }

    const getDimensions = () => {
      switch (template.aspectRatio) {
        case '9:16': return { width: 1080, height: 1920 }
        case '1:1': return { width: 1080, height: 1080 }
        case '2:3': return { width: 1000, height: 1500 }
        case '4:3': return { width: 1200, height: 900 }
        case '16:9': return { width: 1920, height: 1080 }
        case '3:4': return { width: 900, height: 1200 }
        case '8.5:11': return { width: 850, height: 1100 }
        default: return { width: 1080, height: 1920 }
      }
    }

    const dimensions = getDimensions()

    return (
      <div 
        ref={ref}
        className="weekend-card-export"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          background: template.backgroundColor,
          color: template.textColor,
          fontFamily: template.font,
          position: 'relative',
          overflow: 'hidden',
          display: 'block',
          visibility: 'visible'
        }}
      >
        {renderTemplate()}
      </div>
    )
  }
)

WeekendCardGenerator.displayName = 'WeekendCardGenerator'