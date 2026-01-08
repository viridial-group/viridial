import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { IGeocodingProvider, GeocodeResult, ReverseGeocodeResult } from '../interfaces/geocoding-provider.interface';

/**
 * OpenStreetMap Nominatim provider (free, no API key required)
 * Rate limit: 1 request per second (use caching!)
 */
@Injectable()
export class NominatimProviderService implements IGeocodingProvider {
  readonly name = 'nominatim';

  private readonly client: AxiosInstance;
  private readonly baseUrl = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent': 'Viridial-Geolocation-Service/1.0', // Required by Nominatim
      },
      params: {
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
    });
  }

  async geocode(address: string, countryHint?: string): Promise<GeocodeResult | null> {
    try {
      const params: Record<string, string> = {
        q: address,
      };

      if (countryHint) {
        params.countrycodes = countryHint.toLowerCase();
      }

      const response = await this.client.get('/search', { params });

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const result = response.data[0];
      const addressDetails = result.address || {};

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name,
        street: addressDetails.road || addressDetails.pedestrian,
        postalCode: addressDetails.postcode,
        city: addressDetails.city || addressDetails.town || addressDetails.village,
        region: addressDetails.state || addressDetails.region,
        country: addressDetails.country,
        countryCode: addressDetails.country_code?.toUpperCase(),
        confidence: 0.8, // Nominatim doesn't provide confidence, use default
      };
    } catch (error: any) {
      console.error('Nominatim geocode error:', error.message);
      throw new HttpException(
        `Geocoding failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult | null> {
    try {
      const response = await this.client.get('/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
        },
      });

      if (!response.data || !response.data.address) {
        return null;
      }

      const addressDetails = response.data.address;

      return {
        formattedAddress: response.data.display_name,
        street: addressDetails.road || addressDetails.pedestrian,
        postalCode: addressDetails.postcode,
        city: addressDetails.city || addressDetails.town || addressDetails.village,
        region: addressDetails.state || addressDetails.region,
        country: addressDetails.country,
        countryCode: addressDetails.country_code?.toUpperCase(),
      };
    } catch (error: any) {
      console.error('Nominatim reverse geocode error:', error.message);
      throw new HttpException(
        `Reverse geocoding failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

