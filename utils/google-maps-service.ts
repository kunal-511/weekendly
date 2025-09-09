// @ts-nocheck
/**
 * Google Maps Service - Uses free Google APIs for places, restaurants, and events
 * Note: This uses client-side Google Maps JavaScript API which is free up to certain limits
 */

import type {} from "../types/google-maps.d.ts"

declare global {
  interface Window {
    initGoogleMaps: () => void;
  }
}

export interface GooglePlace {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  price_level?: number
  types: string[]
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  opening_hours?: {
    open_now: boolean
    weekday_text?: string[]
  }
  website?: string
  formatted_phone_number?: string
}

export interface WeekendlyPlace {
  id: string
  name: string
  address: string
  rating: number
  priceRange: "$" | "$$" | "$$$" | "$$$$"
  category: string
  location: {
    lat: number
    lng: number
  }
  photos: string[]
  openNow: boolean
  website?: string
  phone?: string
  types: string[]
}

export interface WeekendlyEvent {
  id: string
  title: string
  description: string
  location: string
  address: string
  date: string
  time: string
  category: string
  source: "google_events" | "local_venue"
  coordinates?: {
    lat: number
    lng: number
  }
  venue?: WeekendlyPlace
}

class GoogleMapsService {
  private isLoaded = false
  private loadPromise: Promise<void> | null = null
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Load Google Maps JavaScript API
   */
  async loadGoogleMaps(): Promise<void> {
    if (this.isLoaded) return
    if (this.loadPromise) return this.loadPromise

    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Maps can only be loaded in browser environment'))
        return
      }

      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        this.isLoaded = true
        resolve()
        return
      }

      // Create script element
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        reject(new Error('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file'))
        return
      }

      // Updated to use modern Place API
      const scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async&callback=initGoogleMaps&v=weekly`
      
      // Create a global callback function
      window.initGoogleMaps = () => {
        this.isLoaded = true
        resolve()
      }

      const script = document.createElement('script')
      script.src = scriptSrc
      script.async = true
      script.defer = true

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API. Please check your API key and domain restrictions.'))
      }

      document.head.appendChild(script)
    })

    return this.loadPromise
  }

  /**
   * Check cache for data
   */
  private getCachedData(key: string): unknown | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  /**
   * Set cache data
   */
  private setCachedData(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Fallback to a default location Delhi
          resolve({  lat: 28.6139, lng: 77.2090})
        },
        { timeout: 10000 }
      )
    })
  }

  /**
   * Search for restaurants using Google Places API
   */
  async searchRestaurants(
    location: { lat: number; lng: number },
    radius = 5000,
    query?: string
  ): Promise<WeekendlyPlace[]> {
    const cacheKey = `restaurants_${location.lat}_${location.lng}_${radius}_${query || ''}`
    
    // Check cache first
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached as WeekendlyPlace[]
    }

    try {
      await this.loadGoogleMaps()

      // Try modern Place API first, fallback to legacy PlacesService
      if (window.google?.maps?.places?.searchNearby) {
        const request = {
          location: new window.google.maps.LatLng(location.lat, location.lng),
          radius,
          includedTypes: ['restaurant'],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: new window.google.maps.LatLng(location.lat, location.lng),
              radius
            }
          }
        }

        try {
          const response = await window.google.maps.places.searchNearby(request)
          const places = await Promise.all(
            response.places.map(async (place: any) => {
              // Fetch additional fields for each place
              const fullPlace = await place.fetchFields({
                fields: ['displayName', 'formattedAddress', 'location', 'rating', 'priceLevel', 'photos', 'regularOpeningHours', 'websiteURI', 'nationalPhoneNumber', 'types']
              })
              return this.transformModernPlaceToWeekendlyPlace(fullPlace)
            })
          )
          
          const validPlaces = places.filter(place => place !== null) as WeekendlyPlace[]
          this.setCachedData(cacheKey, validPlaces)
          return validPlaces
        } catch (modernError) {
          console.warn('Modern Place API failed, falling back to legacy PlacesService:', modernError)
        }
      }

      // Fallback to legacy PlacesService
      return new Promise((resolve, reject) => {
        if (!window.google?.maps?.places?.PlacesService) {
          reject(new Error('Google Maps Places API not properly loaded. Please check your API key and internet connection.'))
          return
        }

        const service = new window.google.maps.places.PlacesService(
          document.createElement('div')
        )

        const request = {
          location: new window.google.maps.LatLng(location.lat, location.lng),
          radius,
          type: 'restaurant',
          keyword: query || 'restaurant dining food'
        }

        service.nearbySearch(request as any, (results: unknown, status: unknown) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const places = (results as any[])
              .slice(0, 10)
              .map((result: unknown) => this.transformGooglePlaceToWeekendlyPlace(result))
              .filter((place: unknown) => place !== null) as WeekendlyPlace[]
            
            this.setCachedData(cacheKey, places)
            resolve(places)
          } else {
            reject(new Error('Failed to search restaurants'))
          }
        })
      })
    } catch (error) {
      console.error('Error searching restaurants:', error)
      return []
    }
  }

  /**
   * Search for entertainment venues and activities
   */
  async searchEntertainment(
    location: { lat: number; lng: number },
    radius = 10000,
    query?: string
  ): Promise<WeekendlyPlace[]> {
    const cacheKey = `entertainment_${location.lat}_${location.lng}_${radius}_${query || ''}`
    
    // Check cache first
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached as WeekendlyPlace[]
    }

    try {
      await this.loadGoogleMaps()

      const entertainmentTypes = [
        'amusement_park',
        'art_gallery',
        'bowling_alley',
        'casino',
        'movie_theater',
        'museum',
        'night_club',
        'park',
        'shopping_mall',
        'spa',
        'stadium',
        'tourist_attraction',
        'zoo'
      ]

      const allResults: WeekendlyPlace[] = []

      // Search for each type
      for (const type of entertainmentTypes.slice(0, 3)) { // Limit to 3 types to avoid quota issues
        const places = await this.searchPlacesByType(location, radius, type, query)
        allResults.push(...places.slice(0, 3)) // Max 3 per type
      }

      // Remove duplicates and sort by rating
      const uniquePlaces = allResults
        .filter((place, index, self) => 
          index === self.findIndex(p => p.id === place.id)
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10)

      // Cache the results
      this.setCachedData(cacheKey, uniquePlaces)
      return uniquePlaces
    } catch (error) {
      console.error('Error searching entertainment:', error)
      return []
    }
  }

  /**
   * Search for outdoor activities and parks
   */
  async searchOutdoorActivities(
    location: { lat: number; lng: number },
    radius = 15000
  ): Promise<WeekendlyPlace[]> {
    const cacheKey = `outdoor_${location.lat}_${location.lng}_${radius}`
    
    // Check cache first
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached as WeekendlyPlace[]
    }

    try {
      await this.loadGoogleMaps()

      const outdoorTypes = ['park', 'tourist_attraction', 'natural_feature']
      const allResults: WeekendlyPlace[] = []

      for (const type of outdoorTypes) {
        const places = await this.searchPlacesByType(location, radius, type, 'outdoor nature park')
        allResults.push(...places.slice(0, 4))
      }

      const results = allResults
        .filter((place, index, self) => 
          index === self.findIndex(p => p.id === place.id)
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8)

      // Cache the results
      this.setCachedData(cacheKey, results)
      return results
    } catch (error) {
      console.error('Error searching outdoor activities:', error)
      return []
    }
  }

  /**
   * Search places by specific type
   */
  private async searchPlacesByType(
    location: { lat: number; lng: number },
    radius: number,
    type: string,
    keyword?: string
  ): Promise<WeekendlyPlace[]> {
    try {
      // Try modern Place API first
      if (window.google?.maps?.places?.searchNearby) {
        const request = {
          location: new window.google.maps.LatLng(location.lat, location.lng),
          radius,
          includedTypes: [type],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: new window.google.maps.LatLng(location.lat, location.lng),
              radius
            }
          }
        }

        try {
          const response = await window.google.maps.places.searchNearby(request)
          const places = await Promise.all(
            response.places.map(async (place: any) => {
              const fullPlace = await place.fetchFields({
                fields: ['displayName', 'formattedAddress', 'location', 'rating', 'priceLevel', 'photos', 'regularOpeningHours', 'websiteURI', 'nationalPhoneNumber', 'types']
              })
              return this.transformModernPlaceToWeekendlyPlace(fullPlace)
            })
          )
          
          return places.filter(place => place !== null) as WeekendlyPlace[]
        } catch (modernError) {
          console.warn('Modern Place API failed, falling back to legacy PlacesService:', modernError)
        }
      }

      // Fallback to legacy PlacesService
      return new Promise((resolve) => {
        const service = new window.google.maps.places.PlacesService(
          document.createElement('div')
        )

        const request = {
          location: new window.google.maps.LatLng(location.lat, location.lng),
          radius,
          type: type as unknown,
          keyword
        }

        service.nearbySearch(request as any, (results: unknown, status: unknown) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const places = results
              .map((result: unknown) => this.transformGooglePlaceToWeekendlyPlace(result))
              .filter((place: unknown) => place !== null) as WeekendlyPlace[]
            
            resolve(places)
          } else {
            resolve([])
          }
        })
      })
    } catch (error) {
      console.error('Error searching places by type:', error)
      return []
    }
  }

  /**
   * Transform modern Place API result to WeekendlyPlace
   */
  private transformModernPlaceToWeekendlyPlace = async (place: unknown): Promise<WeekendlyPlace | null> => {
    if (!place.id || !place.displayName || !place.location) {
      return null
    }

    const priceLevel = place.priceLevel
    let priceRange: "$" | "$$" | "$$$" | "$$$$" = "$$"
    
    if (priceLevel !== undefined) {
      switch (priceLevel) {
        case 0:
        case 1:
          priceRange = "$"
          break
        case 2:
          priceRange = "$$"
          break
        case 3:
          priceRange = "$$$"
          break
        case 4:
          priceRange = "$$$$"
          break
      }
    }

    const category = this.getCategoryFromTypes(place.types || [])
    
    const photos = place.photos?.slice(0, 3)
      .filter((photo: unknown) => photo.name) 
      .map((photo: unknown) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.name}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      ) || []

    // Use modern isOpen method instead of deprecated open_now
    let openNow = true
    try {
      openNow = await place.isOpen() ?? true
    } catch {
      // Fallback to regularOpeningHours if isOpen() fails
      openNow = place.regularOpeningHours?.openNow ?? true
    }

    return {
      id: place.id,
      name: place.displayName,
      address: place.formattedAddress || '',
      rating: place.rating || 0,
      priceRange,
      category,
      location: {
        lat: place.location.lat(),
        lng: place.location.lng()
      },
      photos,
      openNow,
      website: place.websiteURI,
      phone: place.nationalPhoneNumber,
      types: place.types || []
    }
  }

  /**
   * Transform legacy Google Place to WeekendlyPlace
   */
  private transformGooglePlaceToWeekendlyPlace = (googlePlace: unknown): WeekendlyPlace | null => {
    if (!googlePlace.place_id || !googlePlace.name || !googlePlace.geometry?.location) {
      return null
    }

    const priceLevel = googlePlace.price_level
    let priceRange: "$" | "$$" | "$$$" | "$$$$" = "$$"
    
    if (priceLevel !== undefined) {
      switch (priceLevel) {
        case 0:
        case 1:
          priceRange = "$"
          break
        case 2:
          priceRange = "$$"
          break
        case 3:
          priceRange = "$$$"
          break
        case 4:
          priceRange = "$$$$"
          break
      }
    }

    const category = this.getCategoryFromTypes(googlePlace.types || [])
    
    const photos = googlePlace.photos?.slice(0, 3)
      .filter((photo: unknown) => photo.photo_reference) 
      .map((photo: unknown) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      ) || []

    const openNow = true

    return {
      id: googlePlace.place_id,
      name: googlePlace.name,
      address: googlePlace.formatted_address || googlePlace.vicinity || '',
      rating: googlePlace.rating || 0,
      priceRange,
      category,
      location: {
        lat: googlePlace.geometry.location.lat(),
        lng: googlePlace.geometry.location.lng()
      },
      photos,
      openNow,
      website: googlePlace.website,
      phone: googlePlace.formatted_phone_number,
      types: googlePlace.types || []
    }
  }

  /**
   * Get category from Google Place types
   */
  private getCategoryFromTypes = (types: string[]): string => {
    const typeMap: Record<string, string> = {
      'restaurant': 'Restaurant',
      'food': 'Food & Dining',
      'meal_takeaway': 'Food & Dining',
      'cafe': 'Cafe',
      'bar': 'Bar & Nightlife',
      'night_club': 'Nightlife',
      'amusement_park': 'Entertainment',
      'art_gallery': 'Arts & Culture',
      'museum': 'Arts & Culture',
      'movie_theater': 'Entertainment',
      'bowling_alley': 'Entertainment',
      'park': 'Outdoor & Nature',
      'zoo': 'Family Fun',
      'shopping_mall': 'Shopping',
      'spa': 'Wellness & Spa',
      'gym': 'Fitness',
      'tourist_attraction': 'Attractions',
      'natural_feature': 'Nature'
    }

    for (const type of types) {
      if (typeMap[type]) {
        return typeMap[type]
      }
    }

    return 'General'
  }

  /**
   * Search for events (using venue data as proxy for events)
   */
  async searchEvents(
    location: { lat: number; lng: number },
    radius = 10000
  ): Promise<WeekendlyEvent[]> {
    const cacheKey = `events_${location.lat}_${location.lng}_${radius}`
    
    // Check cache first
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached as WeekendlyEvent[]
    }

    try {
      // Since Google doesn't have a direct events API, we'll search for venues that commonly host events
      const eventVenueTypes = ['art_gallery', 'museum', 'movie_theater', 'stadium', 'amusement_park']
      const venues: WeekendlyPlace[] = []

      for (const type of eventVenueTypes) {
        const places = await this.searchPlacesByType(location, radius, type)
        venues.push(...places.slice(0, 2))
      }

      // Transform venues into potential events
      const events: WeekendlyEvent[] = venues.map(venue => this.createEventFromVenue(venue)).flat()
      const results = events.slice(0, 8)

      // Cache the results
      this.setCachedData(cacheKey, results)
      return results
    } catch (error) {
      console.error('Error searching events:', error)
      return []
    }
  }

  /**
   * Create potential events from venues
   */
  private createEventFromVenue(venue: WeekendlyPlace): WeekendlyEvent[] {
    const events: WeekendlyEvent[] = []
    const baseEvent = {
      location: venue.name,
      address: venue.address,
      source: 'local_venue' as const,
      coordinates: venue.location,
      venue
    }

    // Generate sample events based on venue type
    if (venue.types.includes('art_gallery') || venue.types.includes('museum')) {
      events.push({
        id: `${venue.id}-exhibition`,
        title: `Art Exhibition at ${venue.name}`,
        description: `Explore contemporary art and cultural exhibitions`,
        date: this.getRandomWeekendDate(),
        time: '10:00 AM - 6:00 PM',
        category: 'Arts & Culture',
        ...baseEvent
      })
    }

    if (venue.types.includes('movie_theater')) {
      events.push({
        id: `${venue.id}-movie`,
        title: `Weekend Movies at ${venue.name}`,
        description: `Catch the latest blockbusters and indie films`,
        date: this.getRandomWeekendDate(),
        time: 'Various showtimes',
        category: 'Entertainment',
        ...baseEvent
      })
    }

    if (venue.types.includes('park') || venue.types.includes('tourist_attraction')) {
      events.push({
        id: `${venue.id}-outdoor`,
        title: `Weekend Activities at ${venue.name}`,
        description: `Enjoy outdoor activities and nature experiences`,
        date: this.getRandomWeekendDate(),
        time: '9:00 AM - 5:00 PM',
        category: 'Outdoor',
        ...baseEvent
      })
    }

    return events
  }

  /**
   * Get random weekend date
   */
  private getRandomWeekendDate(): string {
    const today = new Date()
    const daysUntilSaturday = (6 - today.getDay()) % 7
    const saturday = new Date(today)
    saturday.setDate(today.getDate() + daysUntilSaturday)
    
    // Randomly choose Saturday or Sunday
    const weekendDay = Math.random() > 0.5 ? saturday : new Date(saturday.getTime() + 24 * 60 * 60 * 1000)
    
    return weekendDay.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  /**
   * Get place details
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
    try {
      await this.loadGoogleMaps()

      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      )

      const request = {
        placeId,
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'price_level', 'photos', 'opening_hours', 'website', 'formatted_phone_number', 'types']
      }

      return new Promise((resolve) => {
        service.getDetails(request, (place: unknown, status: unknown) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place as GooglePlace)
          } else {
            resolve(null)
          }
        })
      })
    } catch (error) {
      console.error('Error getting place details:', error)
      return null
    }
  }
}

// Create singleton instance
const googleMapsService = new GoogleMapsService()

export default googleMapsService
