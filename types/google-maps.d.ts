// Google Maps JavaScript API types 
declare global {
  interface Window {
    google: typeof google;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace google {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    namespace places {
      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        NOT_FOUND = 'NOT_FOUND',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR'
      }

      interface SearchNearbyRequest {
        location: LatLng;
        radius: number;
        includedTypes?: string[];
        excludedTypes?: string[];
        maxResultCount?: number;
        locationRestriction?: {
          circle: {
            center: LatLng;
            radius: number;
          };
        };
      }

      interface PlaceSearchRequest {
        location: LatLng;
        radius: number;
        type?: string;
        keyword?: string;
        name?: string;
        query?: string;
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields?: string[];
      }

      interface PlaceResult {
        place_id?: string;
        id?: string;
        name?: string;
        displayName?: string;
        formattedAddress?: string;
        formatted_address?: string;
        vicinity?: string;
        geometry?: {
          location: LatLng;
        };
        location?: LatLng;
        rating?: number;
        price_level?: number;
        priceLevel?: number;
        types?: string[];
        photos?: PlacePhoto[];
        opening_hours?: {
          open_now: boolean;
          weekday_text?: string[];
        };
        regularOpeningHours?: {
          openNow?: boolean;
          weekdayDescriptions?: string[];
        };
        website?: string;
        websiteURI?: string;
        formatted_phone_number?: string;
        nationalPhoneNumber?: string;
        isOpen?: () => Promise<boolean>;
      }

      interface PlacePhoto {
        photo_reference: string;
        name?: string;
        height: number;
        width: number;
        heightPx?: number;
        widthPx?: number;
      }

      // Modern Place class
      class Place {
        constructor(options: { id: string; requestedLanguage?: string });
        id: string;
        displayName?: string;
        formattedAddress?: string;
        location?: LatLng;
        rating?: number;
        priceLevel?: number;
        types?: string[];
        photos?: PlacePhoto[];
        regularOpeningHours?: {
          openNow?: boolean;
          weekdayDescriptions?: string[];
        };
        websiteURI?: string;
        nationalPhoneNumber?: string;
        
        fetchFields(options: { fields: string[] }): Promise<Place>;
        isOpen(date?: Date): Promise<boolean>;
        toJSON(): object;
      }

      class PlacesService {
        constructor(attrContainer: HTMLElement);
        nearbySearch(
          request: PlaceSearchRequest,
          callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void
        ): void;
        getDetails(
          request: PlaceDetailsRequest,
          callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void
        ): void;
      }

      // Modern Place API functions
      function searchNearby(request: SearchNearbyRequest): Promise<{
        places: Place[];
      }>;
    }

    // Geocoder types
    enum GeocoderStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng;
      placeId?: string;
      bounds?: LatLngBounds;
      componentRestrictions?: GeocoderComponentRestrictions;
      region?: string;
    }

    interface GeocoderComponentRestrictions {
      administrativeArea?: string;
      country?: string;
      locality?: string;
      postalCode?: string;
      route?: string;
    }

    interface GeocoderResult {
      address_components: GeocoderAddressComponent[];
      formatted_address: string;
      geometry: GeocoderGeometry;
      place_id: string;
      types: string[];
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    interface GeocoderGeometry {
      bounds?: LatLngBounds;
      location: LatLng;
      location_type: GeocoderLocationType;
      viewport: LatLngBounds;
    }

    enum GeocoderLocationType {
      APPROXIMATE = 'APPROXIMATE',
      GEOMETRIC_CENTER = 'GEOMETRIC_CENTER',
      RANGE_INTERPOLATED = 'RANGE_INTERPOLATED',
      ROOFTOP = 'ROOFTOP'
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      contains(latLng: LatLng): boolean;
      equals(other: LatLngBounds): boolean;
      extend(point: LatLng): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      intersects(other: LatLngBounds): boolean;
      isEmpty(): boolean;
      toJSON(): object;
      toString(): string;
      union(other: LatLngBounds): LatLngBounds;
    }

    class Geocoder {
      constructor();
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
      ): void;
    }
  }
}

export {};
