import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { IGeocodingProvider, GeocodeResult, ReverseGeocodeResult } from '../interfaces/geocoding-provider.interface';

/**
 * Google Maps Geocoding API provider
 * Requires GOOGLE_MAPS_API_KEY environment variable
 */
@Injectable()
export class GoogleProviderService implements IGeocodingProvider {
  readonly name = 'google';

  private readonly client: AxiosInstance;
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.client = axios.create({
      baseURL: 'https://maps.googleapis.com/maps/api/geocode',
      timeout: 10000,
    });
  }

  async geocode(address: string, countryHint?: string): Promise<GeocodeResult | null> {
    if (!this.apiKey) {
      throw new HttpException(
        'Google Maps API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const params: Record<string, string> = {
        address,
        key: this.apiKey,
      };

      if (countryHint) {
        params.region = countryHint.toLowerCase();
      }

      const response = await this.client.get('/json', { params });

      if (response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
        if (response.data.status === 'ZERO_RESULTS') {
          return null;
        }
        throw new HttpException(
          `Google geocoding failed: ${response.data.status}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const result = response.data.results[0];
      const geometry = result.geometry;
      const addressComponents = this.parseAddressComponents(result.address_components);

      return {
        latitude: geometry.location.lat,
        longitude: geometry.location.lng,
        formattedAddress: result.formatted_address,
        street: addressComponents.street,
        postalCode: addressComponents.postalCode,
        city: addressComponents.city,
        region: addressComponents.region,
        country: addressComponents.country,
        countryCode: addressComponents.countryCode,
        confidence: this.calculateConfidence(geometry.location_type),
      };
    } catch (error: any) {
      console.error('Google geocode error:', error.message);
      if (error.response?.status === 403) {
        throw new HttpException('Invalid Google Maps API key', HttpStatus.FORBIDDEN);
      }
      throw new HttpException(
        `Geocoding failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult | null> {
    if (!this.apiKey) {
      throw new HttpException(
        'Google Maps API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await this.client.get('/json', {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
        if (response.data.status === 'ZERO_RESULTS') {
          return null;
        }
        throw new HttpException(
          `Google reverse geocoding failed: ${response.data.status}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const result = response.data.results[0];
      const addressComponents = this.parseAddressComponents(result.address_components);

      return {
        formattedAddress: result.formatted_address,
        street: addressComponents.street,
        postalCode: addressComponents.postalCode,
        city: addressComponents.city,
        region: addressComponents.region,
        country: addressComponents.country,
        countryCode: addressComponents.countryCode,
      };
    } catch (error: any) {
      console.error('Google reverse geocode error:', error.message);
      if (error.response?.status === 403) {
        throw new HttpException('Invalid Google Maps API key', HttpStatus.FORBIDDEN);
      }
      throw new HttpException(
        `Reverse geocoding failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private parseAddressComponents(components: any[]): {
    street?: string;
    postalCode?: string;
    city?: string;
    region?: string;
    country?: string;
    countryCode?: string;
  } {
    const result: any = {};

    for (const component of components) {
      const types = component.types || [];

      if (types.includes('street_number') || types.includes('route')) {
        result.street = result.street
          ? `${component.long_name} ${result.street}`
          : component.long_name;
      } else if (types.includes('postal_code')) {
        result.postalCode = component.long_name;
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        result.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        result.region = component.long_name;
      } else if (types.includes('country')) {
        result.country = component.long_name;
        result.countryCode = component.short_name;
      }
    }

    return result;
  }

  private calculateConfidence(locationType: string): number {
    // Google location types: ROOFTOP > RANGE_INTERPOLATED > GEOMETRIC_CENTER > APPROXIMATE
    const confidenceMap: Record<string, number> = {
      ROOFTOP: 0.95,
      RANGE_INTERPOLATED: 0.85,
      GEOMETRIC_CENTER: 0.75,
      APPROXIMATE: 0.6,
    };

    return confidenceMap[locationType] || 0.5;
  }
}

