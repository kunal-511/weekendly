import type { WeatherData } from "@/types/export"
import type { Activity } from "@/types/activity"
import { activities } from "@/data/actvity"

export class WeatherService {
  private static readonly WEATHER_API_KEY =  'a4e4a6566b3cadcd98cb033abff8aa5a'
  private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5'
  private static readonly GEO_URL = 'https://api.openweathermap.org/geo/1.0'

  static async getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // Default to Delhi 
        resolve({ lat: 28.6139, lon: 77.2090 })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        () => {
         
          resolve({ lat: 28.6139, lon: 77.2090 })
        },
        { timeout: 10000 }
      )
    })
  }

  static async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const forecastResponse = await fetch(
        `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.WEATHER_API_KEY}&units=metric`
      )
      
      if (!forecastResponse.ok) {
        if (forecastResponse.status === 401) {
          throw new Error('Invalid API key. Please check your weather service configuration.')
        }
        if (forecastResponse.status === 429) {
          throw new Error('Weather service rate limit exceeded. Please try again later.')
        }
        throw new Error(`Weather service error: ${forecastResponse.status}`)
      }
      
      const forecastData = await forecastResponse.json()
      
      // reverse geocoding
      const locationData = await this.reverseGeocode(lat, lon)
      
      return this.processForecastData(forecastData, locationData)
    } catch (error) {
      console.error('Error fetching weather:', error)
      return null
    }
  }

  static async getWeatherByCity(city: string): Promise<WeatherData | null> {
    try {
      let coords = await this.geocodeLocation(city)
      
      if (!coords) {
        // Default to Delhi
        coords = { lat: 28.6139, lon: 77.2090, name: 'Delhi, India (default)' }
      }
      
      const weatherData = await this.getWeatherByCoordinates(coords.lat, coords.lon)
      
      if (weatherData && coords.name) {
        weatherData.location = coords.name
      }
      
      return weatherData
    } catch (error) {
      console.error('Error fetching weather:', error)
      try {
        const delhiWeather = await this.getWeatherByCoordinates(28.6139, 77.2090)
        if (delhiWeather) {
          delhiWeather.location = 'Delhi, India (default)'
        }
        return delhiWeather
      } catch (fallbackError) {
        console.error('Error fetching Delhi fallback weather:', fallbackError)
        return null
      }
    }
  }

  private static async geocodeLocation(query: string): Promise<{ lat: number; lon: number; name?: string } | null> {
    try {
      const zipRegex = /^\d{5}(?:[-\s]\d{4})?(?:,\s*[A-Z]{2})?$/i
      
      let geocodeUrl: string
      
      if (zipRegex.test(query.trim())) {
        geocodeUrl = `${this.GEO_URL}/zip?zip=${encodeURIComponent(query.trim())}&appid=${this.WEATHER_API_KEY}`
      } else {
        geocodeUrl = `${this.GEO_URL}/direct?q=${encodeURIComponent(query.trim())}&limit=1&appid=${this.WEATHER_API_KEY}`
      }
      
      const response = await fetch(geocodeUrl)
      
      if (!response.ok) {
        console.error('Geocoding request failed:', response.status)
        return null
      }
      
      const data = await response.json()
      
      if (zipRegex.test(query.trim())) {
        if (data.lat && data.lon) {
          return {
            lat: data.lat,
            lon: data.lon,
            name: data.name ? `${data.name}, ${data.country}` : undefined
          }
        }
      } else {
        if (Array.isArray(data) && data.length > 0) {
          const location = data[0]
          return {
            lat: location.lat,
            lon: location.lon,
            name: location.state 
              ? `${location.name}, ${location.state}, ${location.country}`
              : `${location.name}, ${location.country}`
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Error geocoding location:', error)
      return null
    }
  }

  private static async reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.WEATHER_API_KEY}`
      )
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      
      if (Array.isArray(data) && data.length > 0) {
        const location = data[0]
        return location.state 
          ? `${location.name}, ${location.state}, ${location.country}`
          : `${location.name}, ${location.country}`
      }
      
      return null
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      return null
    }
  }

  private static processForecastData(forecastData: any, locationName: string | null): WeatherData {
    try {
      const now = new Date()
      const nextSaturday = new Date(now)
      const nextSunday = new Date(now)
      
      // Calculate days until next Saturday
      const daysUntilSaturday = (6 - now.getDay()) % 7
      nextSaturday.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday))
      nextSunday.setDate(nextSaturday.getDate() + 1)
      
      // Find forecast data for Saturday and Sunday 
      const saturdayForecasts = forecastData.list.filter((item: any) => {
        const forecastDate = new Date(item.dt * 1000)
        return forecastDate.toDateString() === nextSaturday.toDateString()
      })
      
      const sundayForecasts = forecastData.list.filter((item: any) => {
        const forecastDate = new Date(item.dt * 1000)
        return forecastDate.toDateString() === nextSunday.toDateString()
      })
      
      const saturdayForecast = saturdayForecasts.find((item: any) => {
        const hour = new Date(item.dt * 1000).getHours()
        return hour >= 12 && hour <= 15
      }) || saturdayForecasts[0]
      
      const sundayForecast = sundayForecasts.find((item: any) => {
        const hour = new Date(item.dt * 1000).getHours()
        return hour >= 12 && hour <= 15
      }) || sundayForecasts[0]
      
      // Weather icon mapping
      const getWeatherEmoji = (weatherId: number): string => {
        if (weatherId >= 200 && weatherId < 300) return '⛈️'
        if (weatherId >= 300 && weatherId < 400) return '🌦️'
        if (weatherId >= 500 && weatherId < 600) return '🌧️' 
        if (weatherId >= 600 && weatherId < 700) return '🌨️'
        if (weatherId >= 700 && weatherId < 800) return '🌫️'
        if (weatherId === 800) return '☀️' 
        if (weatherId > 800) return '☁️' 
        return '🌤️' 
      }
      
      const getConditionName = (weatherMain: string): string => {
        const conditions: Record<string, string> = {
          'Clear': 'Sunny',
          'Clouds': 'Cloudy',
          'Rain': 'Rainy',
          'Drizzle': 'Light Rain',
          'Thunderstorm': 'Stormy',
          'Snow': 'Snowy',
          'Mist': 'Misty',
          'Fog': 'Foggy'
        }
        return conditions[weatherMain] || weatherMain
      }
      
      // Use today's data as fallback 
      const todayForecast = forecastData.list[0]
      
      return {
        location: locationName || `${forecastData.city?.name || 'Unknown'}, ${forecastData.city?.country || ''}`.
          trim().replace(/,$/, ''),
        saturday: {
          temperature: Math.round(saturdayForecast?.main?.temp || todayForecast?.main?.temp || 20),
          condition: getConditionName(saturdayForecast?.weather?.[0]?.main || todayForecast?.weather?.[0]?.main || 'Clear'),
          icon: getWeatherEmoji(saturdayForecast?.weather?.[0]?.id || todayForecast?.weather?.[0]?.id || 800),
          precipitation: Math.round((saturdayForecast?.pop || 0) * 100)
        },
        sunday: {
          temperature: Math.round(sundayForecast?.main?.temp || todayForecast?.main?.temp || 20),
          condition: getConditionName(sundayForecast?.weather?.[0]?.main || todayForecast?.weather?.[0]?.main || 'Clear'),
          icon: getWeatherEmoji(sundayForecast?.weather?.[0]?.id || todayForecast?.weather?.[0]?.id || 800),
          precipitation: Math.round((sundayForecast?.pop || 0) * 100)
        }
      }
    } catch (error) {
      console.error('Error processing daily forecast data:', error)
      throw error
    }
  }

}

