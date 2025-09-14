"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WeatherService } from "@/utils/weather-service"
import type { WeatherData } from "@/types/export"
import { MapPin, RefreshCw, Droplets, Wind, Thermometer, Eye, Gauge, Sun, Sunset, Navigation } from "lucide-react"
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

  const getWeatherGradient = (condition: string) => {
    const gradients = {
      'Sunny': 'from-yellow-400 via-orange-400 to-red-400',
      'Cloudy': 'from-gray-400 via-gray-500 to-gray-600',
      'Rainy': 'from-blue-400 via-blue-500 to-blue-600',
      'Light Rain': 'from-cyan-400 via-blue-400 to-blue-500',
      'Stormy': 'from-purple-600 via-indigo-600 to-gray-800',
      'Snowy': 'from-blue-100 via-white to-gray-200',
      'Misty': 'from-gray-300 via-gray-400 to-gray-500',
      'Foggy': 'from-gray-200 via-gray-300 to-gray-400',
    }
    return gradients[condition as keyof typeof gradients] || 'from-blue-400 via-cyan-400 to-teal-400'
  }

  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return 'text-blue-600'
    if (temp <= 10) return 'text-cyan-600'
    if (temp <= 20) return 'text-green-600'
    if (temp <= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <span className="text-white text-xl">🌤️</span>
          </div>
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Weekend Weather
            </div>
            {weather?.location && (
              <div className="text-sm text-gray-600 font-normal flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {weather.location}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleLocationSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name..."
              className="w-full px-4 py-2 bg-white/70 backdrop-blur border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleCurrentLocationClick}
            disabled={loading}
            className="px-4 py-5 bg-white/70 backdrop-blur border-gray-200 hover:bg-blue-50 transition-all shadow-sm"
          >
            <MapPin className="w-6 h-6" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRefreshClick}
            disabled={loading || !location.trim()}
            className="px-4 py-5 bg-white/70 backdrop-blur border-gray-200 hover:bg-blue-50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-6 h-6 transition-transform ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </form>

        {error && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-amber-100 rounded-full">
                <span className="text-amber-600 text-lg">⚠️</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-amber-800 mb-1">Weather Unavailable</div>
                <div className="text-sm text-amber-700 mb-2">{error}</div>
                <button
                  onClick={handleTryAgain}
                  className="px-3 py-1 text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {weather && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getWeatherGradient(weather.saturday.condition)} p-6 text-white shadow-xl`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-2xl">Saturday</div>
                    <div className="text-5xl">{weather.saturday.icon}</div>
                  </div>
                  <div className="text-5xl font-bold mb-2 text-white filter drop-shadow-lg">
                    {weather.saturday.temperature}°C
                  </div>
                  <div className="text-white/90 font-medium text-lg mb-4">{weather.saturday.condition}</div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Thermometer className="w-4 h-4" />
                      <span>Feels {weather.saturday.feelsLike}°C</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Droplets className="w-4 h-4" />
                      <span>{weather.saturday.precipitation}% rain</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Wind className="w-4 h-4" />
                      <span>{weather.saturday.windSpeed} km/h {weather.saturday.windDirection}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Eye className="w-4 h-4" />
                      <span>{weather.saturday.humidity}% humidity</span>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <div className="flex items-center gap-1">
                        <Gauge className="w-3 h-3" />
                        <span>{weather.saturday.pressure} hPa</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        <span>UV {weather.saturday.uvIndex}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        <span>{weather.saturday.visibility} km</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <div className="flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        <span>↑ {weather.saturday.sunrise}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sunset className="w-3 h-3" />
                        <span>↓ {weather.saturday.sunset}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
              </div>

              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getWeatherGradient(weather.sunday.condition)} p-6 text-white shadow-xl`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-2xl">Sunday</div>
                    <div className="text-5xl">{weather.sunday.icon}</div>
                  </div>
                  <div className="text-5xl font-bold mb-2 text-white filter drop-shadow-lg">
                    {weather.sunday.temperature}°C
                  </div>
                  <div className="text-white/90 font-medium text-lg mb-4">{weather.sunday.condition}</div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Thermometer className="w-4 h-4" />
                      <span>Feels {weather.sunday.feelsLike}°C</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Droplets className="w-4 h-4" />
                      <span>{weather.sunday.precipitation}% rain</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Wind className="w-4 h-4" />
                      <span>{weather.sunday.windSpeed} km/h {weather.sunday.windDirection}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Eye className="w-4 h-4" />
                      <span>{weather.sunday.humidity}% humidity</span>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <div className="flex items-center gap-1">
                        <Gauge className="w-3 h-3" />
                        <span>{weather.sunday.pressure} hPa</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        <span>UV {weather.sunday.uvIndex}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        <span>{weather.sunday.visibility} km</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <div className="flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        <span>↑ {weather.sunday.sunrise}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sunset className="w-3 h-3" />
                        <span>↓ {weather.sunday.sunset}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-gray-200">
              <div className="text-center mb-4">
                <div className="text-lg font-semibold text-gray-800 mb-2">Weekend Weather Summary</div>
                <div className="text-sm text-gray-600 mb-4">Perfect conditions for outdoor activities!</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="font-medium text-gray-700 mb-1">Temperature Range</div>
                  <div className="text-lg font-bold text-blue-600">
                    {Math.min(weather.saturday.temperature, weather.sunday.temperature)}° - {Math.max(weather.saturday.temperature, weather.sunday.temperature)}°C
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="font-medium text-gray-700 mb-1">Rain Chance</div>
                  <div className="text-lg font-bold text-cyan-600">
                    {Math.max(weather.saturday.precipitation, weather.sunday.precipitation)}%
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="font-medium text-gray-700 mb-1">Wind Speed</div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.round((weather.saturday.windSpeed + weather.sunday.windSpeed) / 2)} km/h
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center mt-4">
                Last updated: {new Date().toLocaleTimeString()} • Weather updates every hour
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur rounded-xl px-6 py-4 shadow-sm">
              <Loader />
              <div className="text-sm text-gray-600 font-medium">Fetching weather data...</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default WeatherWidget