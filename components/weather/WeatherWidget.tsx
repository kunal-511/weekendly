"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WeatherService } from "@/utils/weather-service"
import type { WeatherData } from "@/types/export"
import { MapPin, RefreshCw } from "lucide-react"
import { Loader } from "../Loader"

interface WeatherWidgetProps {
  onWeatherUpdate?: (weather: WeatherData | null) => void
}

const WeatherWidget = memo(function WeatherWidget({ onWeatherUpdate }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = useCallback(async (useCurrentLocation = false) => {
    setLoading(true)
    setError(null)

    try {
      let weatherData: WeatherData | null = null

      if (useCurrentLocation) {
        const coords = await WeatherService.getCurrentLocation()
        if (coords) {
          weatherData = await WeatherService.getWeatherByCoordinates(coords.lat, coords.lon)
        } else {
          setError('Unable to access your location. Please enable location permissions or enter a city name to search.')
        }
      } else if (location.trim()) {
        weatherData = await WeatherService.getWeatherByCity(location)
        if (!weatherData) {
          setError(`Unable to find weather data for "${location}". Please check the city name and try again.`)
        }
      } else {
        setError('Please enter a city name or allow location access to get weather data.')
        setLoading(false)
        return
      }

      if (weatherData) {
        setWeather(weatherData)
        onWeatherUpdate?.(weatherData)
      } else {
        setError('Weather service is temporarily unavailable. Please try again later.')
      }
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Network error: Unable to connect to weather service. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }, [location, onWeatherUpdate])

  const handleLocationSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    fetchWeather(false)
  }, [fetchWeather])

  const handleCurrentLocationClick = useCallback(() => {
    fetchWeather(true)
  }, [fetchWeather])

  const handleRefreshClick = useCallback(() => {
    fetchWeather(false)
  }, [fetchWeather])

  const handleTryAgain = useCallback(() => {
    setError(null)
    fetchWeather(true)
  }, [fetchWeather])

  useEffect(() => {
    let mounted = true
    const loadWeather = async () => {
      if (mounted) {
        await fetchWeather(true)
      }
    }
    loadWeather()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🌤️</span>
          Weekend Weather {weather?.location ? `- ${weather.location}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleLocationSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleCurrentLocationClick}
            disabled={loading}
            className="px-3"
          >
            <MapPin className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRefreshClick}
            disabled={loading || !location.trim()}
            className="px-3"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </form>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div>
                <div className="font-medium text-yellow-800 mb-1">Weather Unavailable</div>
                <div className="text-sm text-yellow-700">{error}</div>
                <button
                  onClick={handleTryAgain}
                  className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {weather && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold text-lg mb-2">Saturday</div>
                <div className="text-4xl mb-2">{weather.saturday.icon}</div>
                <div className="text-2xl font-bold mb-1">{weather.saturday.temperature}°C</div>
                <div className="text-sm text-gray-600">{weather.saturday.condition}</div>
                {weather.saturday.precipitation > 30 && (
                  <div className="text-xs text-blue-600 mt-1">
                    {weather.saturday.precipitation}% chance of rain
                  </div>
                )}
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="font-semibold text-lg mb-2">Sunday</div>
                <div className="text-4xl mb-2">{weather.sunday.icon}</div>
                <div className="text-2xl font-bold mb-1">{weather.sunday.temperature}°C</div>
                <div className="text-sm text-gray-600">{weather.sunday.condition}</div>
                {weather.sunday.precipitation > 30 && (
                  <div className="text-xs text-blue-600 mt-1">
                    {weather.sunday.precipitation}% chance of rain
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <Loader/>
            <div className="text-sm text-gray-600">Loading weather data...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default WeatherWidget