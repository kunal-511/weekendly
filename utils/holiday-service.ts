import { HOLIDAYS_2025, HOLIDAYS_2026 } from '@/data/data'
import type { Holiday, LongWeekend } from '@/types/activity'
import { format, addDays, getDay,  } from 'date-fns'


const ALL_HOLIDAYS = [...HOLIDAYS_2025, ...HOLIDAYS_2026]

export class HolidayService {
  // Get all holidays in a date range
  static getHolidays(startDate?: Date, endDate?: Date): Holiday[] {
    let holidays = [...ALL_HOLIDAYS]
    
    if (startDate) {
      holidays = holidays.filter(holiday => new Date(holiday.date) >= startDate)
    }
    
    if (endDate) {
      holidays = holidays.filter(holiday => new Date(holiday.date) <= endDate)
    }
    
    return holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Check if a date is a holiday
  static isHoliday(date: Date): Holiday | null {
    const dateString = format(date, 'yyyy-MM-dd')
    return ALL_HOLIDAYS.find(holiday => holiday.date === dateString) || null
  }

  // Find upcoming long weekends
  static getUpcomingLongWeekends(months = 6): LongWeekend[] {
    const now = new Date()
    const endDate = addDays(now, months * 30) 
    const holidays = this.getHolidays(now, endDate)
    const longWeekends: LongWeekend[] = []

    holidays.forEach(holiday => {
      const holidayDate = new Date(holiday.date)
      const dayOfWeek = getDay(holidayDate) 
      
      const longWeekend = this.createLongWeekend(holiday, holidayDate, dayOfWeek)
      if (longWeekend) {
        longWeekends.push(longWeekend)
      }
    })


    const naturalWeekends = this.generateNaturalLongWeekends(now, endDate)
    longWeekends.push(...naturalWeekends)

    return longWeekends
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 10) 
  }

  private static createLongWeekend(holiday: Holiday, holidayDate: Date, dayOfWeek: number): LongWeekend | null {
    let startDate: Date
    let endDate: Date
    let days: ("friday" | "saturday" | "sunday" | "monday")[] = []
    let name: string

    if (dayOfWeek === 1) { 
      startDate = addDays(holidayDate, -2) 
      endDate = holidayDate 
      days = ['saturday', 'sunday', 'monday']
      name = `${holiday.name} Long Weekend`
    } else if (dayOfWeek === 5) {
      startDate = holidayDate 
      endDate = addDays(holidayDate, 2) 
      days = ['friday', 'saturday', 'sunday']
      name = `${holiday.name} Long Weekend`
    } else if (dayOfWeek === 0) { 
      startDate = addDays(holidayDate, -1) 
      endDate = addDays(holidayDate, 1) 
      days = ['saturday', 'sunday', 'monday']
      name = `${holiday.name} Long Weekend`
    } else if (dayOfWeek === 6) {
      startDate = addDays(holidayDate, -1) 
      endDate = addDays(holidayDate, 1) 
      days = ['friday', 'saturday', 'sunday']
      name = `${holiday.name} Long Weekend`
    } else if (dayOfWeek === 2) { 
      startDate = addDays(holidayDate, -1) 
      endDate = addDays(holidayDate, 0) 
      days = ['monday']
      name = `${holiday.name} Bridge (Take Monday Off)`
    } else if (dayOfWeek === 4) { 
      startDate = holidayDate 
      endDate = addDays(holidayDate, 1) 
      days = ['friday']
      name = `${holiday.name} Bridge (Take Friday Off)`
    } else {
      return null 
    }

    return {
      id: `long-weekend-${holiday.id}`,
      name,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      days,
      holiday,
      daysCount: days.length
    }
  }

  private static generateNaturalLongWeekends(startDate: Date, endDate: Date): LongWeekend[] {
    const weekends: LongWeekend[] = []
    const current = new Date(startDate)
    let monthsAdded = 0
    
    while (current <= endDate && monthsAdded < 6) {
      // Find first Friday of each month
      const firstOfMonth = new Date(current.getFullYear(), current.getMonth(), 1)
      const firstFriday = new Date(firstOfMonth)
      
      // Find the first Friday of the month
      while (getDay(firstFriday) !== 5) {
        firstFriday.setDate(firstFriday.getDate() + 1)
      }
      
      if (firstFriday >= startDate && firstFriday <= endDate) {
        const weekend: LongWeekend = {
          id: `natural-weekend-${format(firstFriday, 'yyyy-MM-dd')}`,
          name: 'Monthly Long Weekend Opportunity',
          startDate: format(firstFriday, 'yyyy-MM-dd'),
          endDate: format(addDays(firstFriday, 2), 'yyyy-MM-dd'),
          days: ['friday', 'saturday', 'sunday'],
          daysCount: 3
        }
        weekends.push(weekend)
      }
      
      // Move to next month
      current.setMonth(current.getMonth() + 1)
      current.setDate(1)
      monthsAdded++
    }
    
    return weekends
  }

  // Get next holiday
  static getNextHoliday(): Holiday | null {
    const now = new Date()
    const upcomingHolidays = this.getHolidays(now)
    return upcomingHolidays.length > 0 ? upcomingHolidays[0] : null
  }

  // Get holidays in current month
  static getHolidaysThisMonth(): Holiday[] {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return this.getHolidays(startOfMonth, endOfMonth)
  }

  // Check if current weekend can be extended
  static canExtendCurrentWeekend(): { canExtend: boolean; suggestion?: string } {
    const now = new Date()
    const dayOfWeek = getDay(now)
    
    if (dayOfWeek === 4) {
      return {
        canExtend: true,
        suggestion: 'Take Friday off for a 3-day weekend!'
      }
    }
    
    if (dayOfWeek === 5) {
      return {
        canExtend: true,
        suggestion: 'Perfect! You already have a 3-day weekend!'
      }
    }
    
    if (dayOfWeek === 1) {
      return {
        canExtend: true,
        suggestion: 'Consider taking Mondays off for future long weekends!'
      }
    }
    
    return { canExtend: false }
  }
}

export default HolidayService
