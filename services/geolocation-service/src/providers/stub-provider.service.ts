import { Injectable } from '@nestjs/common';
import { IGeocodingProvider, GeocodeResult, ReverseGeocodeResult } from '../interfaces/geocoding-provider.interface';

/**
 * Stub provider for testing and offline development
 * Returns mock data for common addresses
 */
@Injectable()
export class StubProviderService implements IGeocodingProvider {
  readonly name = 'stub';

  private readonly mockGeocodes: Record<string, GeocodeResult> = {
    'paris': {
      latitude: 48.8566,
      longitude: 2.3522,
      formattedAddress: 'Paris, France',
      city: 'Paris',
      country: 'France',
      countryCode: 'FR',
      confidence: 0.9,
    },
    '10 rue exemple paris': {
      latitude: 48.8566,
      longitude: 2.3522,
      formattedAddress: '10 Rue Exemple, Paris, France',
      street: '10 Rue Exemple',
      city: 'Paris',
      country: 'France',
      countryCode: 'FR',
      confidence: 0.8,
    },
    'new york': {
      latitude: 40.7128,
      longitude: -74.0060,
      formattedAddress: 'New York, NY, USA',
      city: 'New York',
      region: 'New York',
      country: 'United States',
      countryCode: 'US',
      confidence: 0.9,
    },
    'london': {
      latitude: 51.5074,
      longitude: -0.1278,
      formattedAddress: 'London, UK',
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      confidence: 0.9,
    },
  };

  async geocode(address: string, countryHint?: string): Promise<GeocodeResult | null> {
    const normalizedAddress = address.toLowerCase().trim();

    // Try exact match first
    if (this.mockGeocodes[normalizedAddress]) {
      return { ...this.mockGeocodes[normalizedAddress] };
    }

    // Try partial match
    for (const [key, value] of Object.entries(this.mockGeocodes)) {
      if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
        return { ...value };
      }
    }

    // Default: return Paris for unknown addresses (for testing)
    return {
      latitude: 48.8566,
      longitude: 2.3522,
      formattedAddress: address,
      city: 'Paris',
      country: 'France',
      countryCode: 'FR',
      confidence: 0.5,
    };
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult | null> {
    // Simple stub: return formatted coordinates as address
    return {
      formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      city: 'Unknown',
      country: 'Unknown',
      countryCode: 'XX',
    };
  }
}

