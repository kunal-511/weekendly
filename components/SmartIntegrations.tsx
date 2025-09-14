"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, Star, Clock, Phone, Globe, Navigation, Route, Search, X, Sparkles, Filter, TrendingUp, Users, Calendar, MapIcon, ChevronDown, ChevronUp } from "lucide-react"
import googleMapsService, { type WeekendlyPlace, type WeekendlyEvent } from "@/utils/google-maps-service"
import { Loader } from "./Loader"
import Link from "next/link"

export function SmartIntegrations() {
  const [isExpanded, setIsExpanded] = useState(false)
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
    if (isExpanded) {
      initializeLocation()
    }
  }, [isExpanded, initializeLocation])

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
    <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50/30 backdrop-blur-sm rounded-2xl border-0 shadow-lg overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-4 text-white relative overflow-hidden hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold">Smart Discoveries</h3>
              <p className="text-white/80 text-sm">
                Discover restaurants, events, and attractions near you
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
              <MapIcon className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium text-white/90">Powered by Google</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">

          <div className="p-6 space-y-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter city or location..."
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                    className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-800 placeholder-gray-400"
                    disabled={isSearchingCity}
                  />
                  {cityQuery && (
                    <button
                      onClick={() => setCityQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔍 Search {activeTab}
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={`Find ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-800 placeholder-gray-400"
                    disabled={loading}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-end gap-2">
                <button
                  onClick={handleCitySearch}
                  disabled={!cityQuery.trim() || isSearchingCity}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                >
                  {isSearchingCity ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      <span>Set Location</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleSearch}
                  disabled={loading || !userCoordinates}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  <span>Discover</span>
                </button>
              </div>
            </div>
          </div>

          {locationError && (
            <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Navigation className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Location Notice</h4>
                  <p className="text-amber-700 text-sm leading-relaxed">{locationError}</p>
                </div>
              </div>
            </div>
          )}

          {apiError && (
            <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-r-xl shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">Service Error</h4>
                    <p className="text-red-700 text-sm leading-relaxed mb-3">{apiError}</p>
                    <button
                      onClick={initializeLocation}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-800">Browse Categories</h4>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleTabChange("restaurants")}
                className={`group relative p-4 rounded-xl border-2 transition-all ${activeTab === "restaurants"
                    ? "border-orange-400 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg"
                    : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full transition-colors ${activeTab === "restaurants" ? "bg-orange-100" : "bg-gray-100 group-hover:bg-orange-100"
                    }`}>
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">Restaurants</div>
                    <div className="text-xs text-gray-600">{restaurants.length} found</div>
                  </div>
                </div>
                {activeTab === "restaurants" && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                )}
              </button>

              <button
                onClick={() => handleTabChange("entertainment")}
                className={`group relative p-4 rounded-xl border-2 transition-all ${activeTab === "entertainment"
                    ? "border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg"
                    : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full transition-colors ${activeTab === "entertainment" ? "bg-purple-100" : "bg-gray-100 group-hover:bg-purple-100"
                    }`}>
                    <span className="text-2xl">🎭</span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">Entertainment</div>
                    <div className="text-xs text-gray-600">{entertainment.length} found</div>
                  </div>
                </div>
                {activeTab === "entertainment" && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                )}
              </button>

              <button
                onClick={() => handleTabChange("outdoor")}
                className={`group relative p-4 rounded-xl border-2 transition-all ${activeTab === "outdoor"
                    ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full transition-colors ${activeTab === "outdoor" ? "bg-green-100" : "bg-gray-100 group-hover:bg-green-100"
                    }`}>
                    <span className="text-2xl">🌳</span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">Outdoor</div>
                    <div className="text-xs text-gray-600">{outdoor.length} found</div>
                  </div>
                </div>
                {activeTab === "outdoor" && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </button>

              <button
                onClick={() => handleTabChange("events")}
                className={`group relative p-4 rounded-xl border-2 transition-all ${activeTab === "events"
                    ? "border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full transition-colors ${activeTab === "events" ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-100"
                    }`}>
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">Events</div>
                    <div className="text-xs text-gray-600">{events.length} found</div>
                  </div>
                </div>
                {activeTab === "events" && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </button>
            </div>
          </div>

          <div className="px-6 py-6 min-h-[400px] bg-gradient-to-b from-white to-gray-50/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <Loader />
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl"></div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Discovering Amazing Places</h3>
                  <p className="text-gray-600">Finding the best {activeTab} near you...</p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {(activeTab === "restaurants" || activeTab === "entertainment" || activeTab === "outdoor") && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800 capitalize">
                        Best {activeTab} Near You
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {(() => {
                            const count = activeTab === "restaurants" ? restaurants.length :
                              activeTab === "entertainment" ? entertainment.length : outdoor.length;
                            return `${count} recommendation${count !== 1 ? 's' : ''}`;
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {(() => {
                        const currentPlaces = activeTab === "restaurants" ? restaurants :
                          activeTab === "entertainment" ? entertainment : outdoor;

                        return currentPlaces.length === 0 ? (
                          <div className="col-span-full">
                            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                              <div className="text-6xl mb-4 opacity-50">
                                {activeTab === "restaurants" ? "🍽️" : activeTab === "entertainment" ? "🎭" : "🌳"}
                              </div>
                              <h3 className="text-xl font-semibold text-gray-700 mb-2">No {activeTab} found</h3>
                              <p className="text-gray-600 mb-4">Try adjusting your location or search terms</p>
                              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Search className="w-4 h-4" />
                                <span>Expand your search radius or try different keywords</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          currentPlaces.map((place, index) => {
                            const categoryColors = {
                              restaurants: "from-orange-500 to-red-500",
                              entertainment: "from-purple-500 to-indigo-500",
                              outdoor: "from-green-500 to-emerald-500"
                            };

                            return (
                              <div
                                key={place.id}
                                className="group relative bg-white rounded-2xl border border-gray-200 hover:border-gray-300 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                              >
                                <div className={`h-1 bg-gradient-to-r ${categoryColors[activeTab as keyof typeof categoryColors]}`}></div>

                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 pr-4">
                                      <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-gray-700 transition-colors">
                                        {place.name}
                                      </h4>
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                                          {place.category}
                                        </span>
                                        <span className="text-gray-500">•</span>
                                        <span className="font-semibold text-gray-700">{place.priceRange}</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span className="font-bold text-yellow-700">{place.rating.toFixed(1)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3 mb-4">
                                    <div className="flex items-start gap-3">
                                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                      <span className="text-sm text-gray-600 leading-relaxed">{place.address}</span>
                                    </div>
                                    {place.phone && (
                                      <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600">{place.phone}</span>
                                      </div>
                                    )}
                                    {place.website && (
                                      <div className="flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <Link
                                          href={place.website}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                        >
                                          Visit Website
                                        </Link>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <Link
                                      href={getDirectionsUrl(place)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${categoryColors[activeTab as keyof typeof categoryColors]} text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm flex-1 justify-center`}
                                    >
                                      <Route className="w-4 h-4" />
                                      <span>Get Directions</span>
                                    </Link>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <span>#{index + 1}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                              </div>
                            )
                          })
                        );
                      })()}
                    </div>
                  </div>
                )}

                {activeTab === "events" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800">
                        Upcoming Events Near You
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{events.length} event{events.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {events.length === 0 ? (
                        <div className="col-span-full">
                          <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-300">
                            <div className="text-6xl mb-4 opacity-50">📅</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
                            <p className="text-gray-600 mb-4">Events are curated from popular local venues</p>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>Check back later for new events</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        events.map((event, index) => (
                          <div
                            key={event.id}
                            className="group relative bg-white rounded-2xl border border-gray-200 hover:border-gray-300 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          >
                            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 pr-4">
                                  <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-gray-700 transition-colors">
                                    {event.title}
                                  </h4>
                                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{event.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    {event.category}
                                  </span>
                                  {event.venue && (
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                      <span className="text-xs font-bold text-yellow-700">{event.venue.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3 mb-4">
                                <div className="flex items-start gap-3">
                                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-600 leading-relaxed">{event.location}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                                      {event.date}
                                    </span>
                                    <span className="text-gray-500">•</span>
                                    <span className="font-semibold text-gray-700">{event.time}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Link
                                  href={getEventDirectionsUrl(event)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm flex-1 justify-center"
                                >
                                  <Route className="w-4 h-4" />
                                  <span>Get Directions</span>
                                </Link>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {event.source.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs text-gray-500">#{index + 1}</span>
                                </div>
                              </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartIntegrations
