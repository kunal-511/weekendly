import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'
import { createEvent, EventAttributes } from 'ics'
import type { WeekendSchedule } from '@/types/activity'
import type { ExportOptions, SocialShareData, WeatherData } from '@/types/export'

export class ExportService {
  static async exportAsImage(element: HTMLElement, options: ExportOptions): Promise<string> {
    const { format, quality } = options
    
    try {
      if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) {
        throw new Error('Element is not visible or has no dimensions')
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      
      element.style.display = 'block'
      element.style.visibility = 'visible'
      
      let dataUrl: string
      
      const exportOptions = {
        quality: quality / 100,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        cacheBust: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        skipFonts: false,
        fontEmbedCSS: '',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: element.offsetWidth + 'px',
          height: element.offsetHeight + 'px'
        }
      }
      
      try {
        console.log('Exporting with html2canvas...')
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: element.offsetWidth,
          height: element.offsetHeight,
          windowWidth: element.offsetWidth,
          windowHeight: element.offsetHeight,
          scrollX: 0,
          scrollY: 0,
          ignoreElements: (element) => {
            return element.tagName === 'SCRIPT' || element.tagName === 'NOSCRIPT'
          }
        })
        
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error('Generated empty canvas')
        }
        
        dataUrl = canvas.toDataURL('image/png', quality / 100)
        
        if (!dataUrl || dataUrl === 'data:,') {
          throw new Error('Generated empty image data')
        }
        
        return dataUrl
      } catch (canvasError) {
        console.warn('html2canvas failed, trying html-to-image:', canvasError)
        
        // Fallback to html-to-image
        if (format === 'png') {
          dataUrl = await toPng(element, exportOptions)
        } else {
          throw new Error(`Unsupported image format: ${format}`)
        }

        if (!dataUrl || dataUrl === 'data:,') {
          throw new Error('Generated empty image data')
        }

        return dataUrl
      }
    } catch (error) {
      console.error('Error exporting image:', error)
      throw new Error(`Failed to export image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async exportAsPDF(element: HTMLElement): Promise<Blob> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      return pdf.output('blob')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      throw new Error('Failed to export PDF')
    }
  }

  static generateCalendarFile(schedule: WeekendSchedule, title: string = 'My Weekend Plan'): string {
    const events: EventAttributes[] = []
    const now = new Date()
    
    const daysUntilSaturday = (6 - now.getDay()) % 7
    const saturday = new Date(now)
    saturday.setDate(now.getDate() + daysUntilSaturday)
    
    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)

    const createTimeSlot = (day: Date, timeSlot: 'morning' | 'afternoon' | 'evening') => {
      const times = {
        morning: { start: 9, end: 12 },
        afternoon: { start: 13, end: 17 },
        evening: { start: 18, end: 22 }
      }
      
      const startTime = new Date(day)
      startTime.setHours(times[timeSlot].start, 0, 0, 0)
      
      const endTime = new Date(day)
      endTime.setHours(times[timeSlot].end, 0, 0, 0)
      
      return { start: startTime, end: endTime }
    }

    Object.entries(schedule.saturday).forEach(([timeSlot, activities]) => {
      if (activities.length > 0) {
        const { start} = createTimeSlot(saturday, timeSlot as 'morning' | 'afternoon' | 'evening')
        
        activities.forEach((activity, index) => {
          const activityStart = new Date(start)
          activityStart.setHours(start.getHours() + index * Math.floor(activity.duration))
          
          const activityEnd = new Date(activityStart)
          activityEnd.setHours(activityStart.getHours() + activity.duration)

          events.push({
            title: activity.title,
            description: activity.description,
            start: [
              activityStart.getFullYear(),
              activityStart.getMonth() + 1,
              activityStart.getDate(),
              activityStart.getHours(),
              activityStart.getMinutes()
            ],
            end: [
              activityEnd.getFullYear(),
              activityEnd.getMonth() + 1,
              activityEnd.getDate(),
              activityEnd.getHours(),
              activityEnd.getMinutes()
            ],
            location: `${activity.category.name} Activity`,
            categories: [activity.category.name],
            status: 'CONFIRMED'
          })
        })
      }
    })

    Object.entries(schedule.sunday).forEach(([timeSlot, activities]) => {
      if (activities.length > 0) {
        const { start } = createTimeSlot(sunday, timeSlot as 'morning' | 'afternoon' | 'evening')
        
        activities.forEach((activity, index) => {
          const activityStart = new Date(start)
          activityStart.setHours(start.getHours() + index * Math.floor(activity.duration))
          
          const activityEnd = new Date(activityStart)
          activityEnd.setHours(activityStart.getHours() + activity.duration)

          events.push({
            title: activity.title,
            description: activity.description,
            start: [
              activityStart.getFullYear(),
              activityStart.getMonth() + 1,
              activityStart.getDate(),
              activityStart.getHours(),
              activityStart.getMinutes()
            ],
            end: [
              activityEnd.getFullYear(),
              activityEnd.getMonth() + 1,
              activityEnd.getDate(),
              activityEnd.getHours(),
              activityEnd.getMinutes()
            ],
            location: `${activity.category.name} Activity`,
            categories: [activity.category.name],
            status: 'CONFIRMED'
          })
        })
      }
    })

    try {
      const { error, value } = createEvent({
        title: title,
        description: 'Weekend plan created with Weekendly',
        start: [saturday.getFullYear(), saturday.getMonth() + 1, saturday.getDate()],
        duration: { days: 2 },
        attendees: []
      })

      if (error) {
        console.error('Error creating calendar:', error)
        throw new Error('Failed to create calendar file')
      }

      return value || ''
    } catch (error) {
      console.error('Error generating calendar file:', error)
      throw new Error('Failed to generate calendar file')
    }
  }

  static generateTextSummary(schedule: WeekendSchedule, weather?: WeatherData): string {
    let summary = "🌟 MY WEEKEND PLAN 🌟\n\n"
    
    summary += "📅 SATURDAY\n"
    if (weather) {
      summary += `🌡️ ${weather.saturday.temperature}°C - ${weather.saturday.condition} ${weather.saturday.icon}\n`
    }
    summary += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    
    Object.entries(schedule.saturday).forEach(([timeSlot, activities]) => {
      if (activities.length > 0) {
        const timeEmoji = timeSlot === 'morning' ? '🌅' : timeSlot === 'afternoon' ? '☀️' : '🌙'
        summary += `${timeEmoji} ${timeSlot.toUpperCase()}\n`
        activities.forEach(activity => {
          summary += `  ${activity.icon} ${activity.title}\n`
        })
        summary += "\n"
      }
    })

    summary += "📅 SUNDAY\n"
    if (weather) {
      summary += `🌡️ ${weather.sunday.temperature}°C - ${weather.sunday.condition} ${weather.sunday.icon}\n`
    }
    summary += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    
    Object.entries(schedule.sunday).forEach(([timeSlot, activities]) => {
      if (activities.length > 0) {
        const timeEmoji = timeSlot === 'morning' ? '🌅' : timeSlot === 'afternoon' ? '☀️' : '🌙'
        summary += `${timeEmoji} ${timeSlot.toUpperCase()}\n`
        activities.forEach(activity => {
          summary += `  ${activity.icon} ${activity.title}\n`
        })
        summary += "\n"
      }
    })

    summary += "✨ Made with Weekendly\n"
    summary += "🌐 Plan your perfect weekend at weekendly.app"

    return summary
  }

  static generateSocialShareData(schedule: WeekendSchedule, platform: string): SocialShareData {
    const totalActivities = Object.values(schedule.saturday).flat().length + 
                           Object.values(schedule.sunday).flat().length

    const shareData: Record<string, SocialShareData> = {
      instagram: {
        platform: 'instagram',
        content: `My perfect weekend plan! ${totalActivities} amazing activities lined up 🌟 #weekendgoals #weekendplans #weekendly`,
        hashtags: ['weekendgoals', 'weekendplans', 'weekendvibes', 'weekendly'],
      },
      twitter: {
        platform: 'twitter',
        content: `Just planned the perfect weekend with ${totalActivities} activities! 🎉 Check out my plans and get inspired for your weekend too! #weekendplans #weekend`,
        hashtags: ['weekendplans', 'weekend', 'weekendgoals'],
      },
      facebook: {
        platform: 'facebook',
        content: `I'm so excited about my weekend plan! ${totalActivities} fun activities to make it unforgettable. What are your weekend plans? 🌟`,
        hashtags: [],
      },
      whatsapp: {
        platform: 'whatsapp',
        content: `Hey! Check out my weekend plan - ${totalActivities} amazing activities! Want to join me for any of them? 😊`,
        hashtags: [],
      }
    }

    return shareData[platform] || shareData.instagram
  }

  static async downloadFile(blob: Blob, filename: string): Promise<void> {
    try {
      // Check if the browser supports the download attribute
      const a = document.createElement('a')
      if (typeof a.download === 'undefined') {
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 100)
        return
      }

      const url = URL.createObjectURL(blob)
      a.href = url
      a.download = filename
      a.style.display = 'none'
      
      document.body.appendChild(a)
      
      a.click()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
      
    } catch (error) {
      console.error('Download failed:', error)
      throw new Error('Failed to download file')
    }
  }

  static async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

}