export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  confidence?: number; // 0-1 scale
}

export interface ReverseGeocodeResult {
  formattedAddress: string;
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
}

export interface IGeocodingProvider {
  /**
   * Geocode an address to coordinates
   */
  geocode(address: string, countryHint?: string): Promise<GeocodeResult | null>;

  /**
   * Reverse geocode coordinates to an address
   */
  reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult | null>;

  /**
   * Provider name (e.g., 'google', 'nominatim', 'stub')
   */
  readonly name: string;
}

