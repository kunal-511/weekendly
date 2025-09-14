"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, Star, Clock, Phone, Globe, Navigation, Route, Search, X } from "lucide-react"
import googleMapsService, { type WeekendlyPlace, type WeekendlyEvent } from "@/utils/google-maps-service"
import { Loader } from "./Loader"
import Link from "next/link"

export function SmartIntegrations() {
  const [activeTab, setActiveTab] = useState<"events" | "restaurants" | "outdoor" | "entertainment">("restaurants")
  const [restaurants, setRestaurants] = useState<WeekendlyPlace[]>([])
  const [entertainment, setEntertainment] = useState<WeekendlyPlace[]>([])
  const [outdoor, setOutdoor] = useState<WeekendlyPlace[]>([])
  const [events, setEvents] = useState<WeekendlyEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cityQuery, setCityQuery] = useState("")
  const [isSearchingCity, setIsSearchingCity] = useState(false)

  const loadRestaurants = useCallback(async (coordinates: { lat: number; lng: number }, query?: string) => {
    setLoading(true)
    setApiError(null)
    try {
      const restaurantResults = await googleMapsService.searchRestaurants(coordinates, 5000, query)
      setRestaurants(restaurantResults)
    } catch (error: unknown) {
      console.error('Error loading restaurants:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage?.includes('API') || errorMessage?.includes('domain')) {
        setApiError("API Error: " + errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const initializeLocation = useCallback(async () => {
    setLoading(true)
    setLocationError(null)
    setApiError(null)

    try {
      const coordinates = await googleMapsService.getCurrentLocation()
      if (coordinates) {
        setUserCoordinates(coordinates)
        await loadRestaurants(coordinates)
      } else {
        setLocationError("Unable to get your location. Using default location.")
        const defaultCoords = { lat: 28.6139, lng: 77.20907 }
        setUserCoordinates(defaultCoords)
        await loadRestaurants(defaultCoords)
      }
    } catch (error: unknown) {
      console.error('Error initializing location:', error)

      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage?.includes('API key') || errorMessage?.includes('ApiTargetBlocked')) {
        setApiError("Google Maps API configuration issue.")
      } else {
        setLocationError("Error accessing location services.")
      }
    } finally {
      setLoading(false)
    }
  }, [loadRestaurants])

  useEffect(() => {
    initializeLocation()
  }, [initializeLocation])

  const loadEntertainment = async (coordinates: { lat: number; lng: number }, query?: string) => {
    setLoading(true)
    try {
      const entertainmentResults = await googleMapsService.searchEntertainment(coordinates, 10000, query)
      setEntertainment(entertainmentResults)
    } catch (error) {
      console.error('Error loading entertainment:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOutdoorActivities = async (coordinates: { lat: number; lng: number }) => {
    setLoading(true)
    try {
      const outdoorResults = await googleMapsService.searchOutdoorActivities(coordinates, 15000)
      setOutdoor(outdoorResults)
    } catch (error) {
      console.error('Error loading outdoor activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async (coordinates: { lat: number; lng: number }) => {
    setLoading(true)
    try {
      const eventResults = await googleMapsService.searchEvents(coordinates, 10000)
      setEvents(eventResults)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = async (tab: "events" | "restaurants" | "outdoor" | "entertainment") => {
    setActiveTab(tab)

    if (!userCoordinates) return

    const query = searchQuery.trim() || undefined

    switch (tab) {
      case "restaurants":
        await loadRestaurants(userCoordinates, query)
        break
      case "entertainment":
        await loadEntertainment(userCoordinates, query)
        break
      case "outdoor":
        await loadOutdoorActivities(userCoordinates)
        break
      case "events":
        await loadEvents(userCoordinates)
        break
    }
  }

  const getDirectionsUrl = (place: WeekendlyPlace) => {
    const destination = encodeURIComponent(`${place.name}, ${place.address}`)
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${place.id}`
  }

  const getEventDirectionsUrl = (event: WeekendlyEvent) => {
    const destination = encodeURIComponent(`${event.location}, ${event.address}`)
    if (event.coordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}`
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`
  }

  const handleSearch = async () => {
    if (!userCoordinates) return

    const query = searchQuery.trim() || undefined

    switch (activeTab) {
      case "restaurants":
        await loadRestaurants(userCoordinates, query)
        break
      case "entertainment":
        await loadEntertainment(userCoordinates, query)
        break
      case "outdoor":
        await loadOutdoorActivities(userCoordinates)
        break
      case "events":
        await loadEvents(userCoordinates)
        break
    }
  }

  const searchCity = async (cityName: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      await googleMapsService.loadGoogleMaps()

      if (!window.google?.maps?.Geocoder) {
        console.error('Google Maps Geocoder not available')
        return null
      }

      const geocoder = new window.google.maps.Geocoder()

      return new Promise((resolve) => {
        geocoder.geocode(
          { address: cityName },
          (results: unknown[] | null, status: string) => {
            if (status === 'OK' && results && results[0]) {
              const result = results[0] as { geometry: { location: { lat(): number; lng(): number } } }
              const location = result.geometry.location
              resolve({
                lat: location.lat(),
                lng: location.lng()
              })
            } else {
              resolve(null)
            }
          }
        )
      })
    } catch (error) {
      console.error('Error geocoding city:', error)
      return null
    }
  }

  const handleCitySearch = async () => {
    if (!cityQuery.trim()) return

    setIsSearchingCity(true)
    setLocationError(null)
    setApiError(null)

    try {
      const coordinates = await searchCity(cityQuery.trim())
      if (coordinates) {
        setUserCoordinates(coordinates)
        setLocationError(null)

        const query = searchQuery.trim() || undefined

        switch (activeTab) {
          case "restaurants":
            await loadRestaurants(coordinates, query)
            break
          case "entertainment":
            await loadEntertainment(coordinates, query)
            break
          case "outdoor":
            await loadOutdoorActivities(coordinates)
            break
          case "events":
            await loadEvents(coordinates)
            break
        }
      } else {
        setLocationError(`Unable to find location for "${cityQuery}". Please try a different city name.`)
      }
    } catch (error) {
      console.error('Error searching city:', error)
      setApiError('Failed to search for city. Please try again.')
    } finally {
      setIsSearchingCity(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">🌟 Smart Discoveries</h3>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Powered by Google Maps</span>
          <span className="sm:hidden">Google Maps</span>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by city (e.g., New York, London)..."
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSearchingCity}
            />
            {cityQuery && (
              <button
                onClick={() => setCityQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleCitySearch}
            disabled={!cityQuery.trim() || isSearchingCity}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {isSearchingCity ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search City</span>
                <span className="sm:hidden">Search</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !userCoordinates}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {locationError && (
        <div className="mb-3 sm:mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2 text-yellow-800">
            <Navigation className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm leading-tight">{locationError}</span>
          </div>
        </div>
      )}

      {apiError && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-1 text-sm sm:text-base">Google Maps API Error</h4>
              <p className="text-xs sm:text-sm text-red-700 mb-2 leading-tight">{apiError}</p>
              <button
                onClick={initializeLocation}
                className="mt-2 text-xs sm:text-sm bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="flex mb-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => handleTabChange("restaurants")}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === "restaurants"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <span className="sm:hidden">🍽️ ({restaurants.length})</span>
          <span className="hidden sm:inline">🍽️ Restaurants ({restaurants.length})</span>
        </button>
        <button
          onClick={() => handleTabChange("entertainment")}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === "entertainment"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <span className="sm:hidden">🎭 ({entertainment.length})</span>
          <span className="hidden sm:inline">🎭 Entertainment ({entertainment.length})</span>
        </button>
        <button
          onClick={() => handleTabChange("outdoor")}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === "outdoor"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <span className="sm:hidden">🌳 ({outdoor.length})</span>
          <span className="hidden sm:inline">🌳 Outdoor ({outdoor.length})</span>
        </button>
        <button
          onClick={() => handleTabChange("events")}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === "events"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <span className="sm:hidden">📅 ({events.length})</span>
          <span className="hidden sm:inline">📅 Events ({events.length})</span>
        </button>
      </div>

      <div className="min-h-[180px] sm:min-h-[200px]">
        {loading ? (
          <div className="text-center py-4 sm:py-6">
            <Loader />
            <p className="ml-2 text-gray-600 text-sm sm:text-base">Discovering amazing places near you...</p>
          </div>
        ) : (
          <>
            {(activeTab === "restaurants" || activeTab === "entertainment" || activeTab === "outdoor") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {(() => {
                  const currentPlaces = activeTab === "restaurants" ? restaurants :
                    activeTab === "entertainment" ? entertainment : outdoor;

                  return currentPlaces.length === 0 ? (
                    <div className="col-span-full text-center py-6 sm:py-8 text-gray-500">
                      <div className="text-3xl sm:text-4xl mb-2">
                        {activeTab === "restaurants" ? "🍽️" : activeTab === "entertainment" ? "🎭" : "🌳"}
                      </div>
                      <p className="text-sm sm:text-base">No {activeTab} found nearby. Try adjusting your search!</p>
                    </div>
                  ) : (
                    currentPlaces.map((place) => (
                      <div
                        key={place.id}
                        className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                      >

                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 flex-1 text-sm sm:text-base pr-2">{place.name}</h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                            <span className="text-xs sm:text-sm font-medium">{place.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="text-xs sm:text-sm text-gray-600 mb-2">
                          {place.category} • {place.priceRange}
                        </div>

                        <div className="text-xs text-gray-500 space-y-1 mb-3">
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span className="text-xs leading-tight">{place.address}</span>
                          </div>
                          {place.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">{place.phone}</span>
                            </div>
                          )}
                          {place.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 flex-shrink-0" />
                              <Link href={place.website} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate text-xs">
                                Website
                              </Link>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${place.openNow ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-xs text-gray-600">
                              {place.openNow ? 'Open now' : 'Closed'}
                            </span>
                          </div>
                          <Link
                            href={getDirectionsUrl(place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-xs flex-shrink-0"
                          >
                            <Route className="w-3 h-3" />
                            <span className="hidden sm:inline">Directions</span>
                            <span className="sm:hidden">Go</span>
                          </Link>
                        </div>
                      </div>
                    ))
                  );
                })()}
              </div>
            )}

            {activeTab === "events" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {events.length === 0 ? (
                  <div className="col-span-full text-center py-6 sm:py-8 text-gray-500">
                    <div className="text-3xl sm:text-4xl mb-2">📅</div>
                    <p className="text-sm sm:text-base">No events found nearby. Events are generated from local venues!</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base flex-1">{event.title}</h4>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex-shrink-0">
                          {event.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-tight">{event.description}</p>
                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{event.date} • {event.time}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 flex-shrink-0" />
                            <span>Rating: {event.venue.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded truncate flex-shrink-0">
                          {event.source.replace('_', ' ')}
                        </span>
                        <Link
                          href={getEventDirectionsUrl(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-xs flex-shrink-0"
                        >
                          <Route className="w-3 h-3" />
                          <span className="hidden sm:inline">Directions</span>
                          <span className="sm:hidden">Go</span>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SmartIntegrations
