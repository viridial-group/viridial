import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

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
  confidence?: number;
}

@Injectable()
export class GeolocationClientService {
  private readonly logger = new Logger(GeolocationClientService.name);
  private readonly geolocationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Get geolocation service URL from env or use default
    this.geolocationServiceUrl =
      this.configService.get<string>('GEOLOCATION_SERVICE_URL') ||
      process.env.GEOLOCATION_SERVICE_URL ||
      'http://geolocation-service:3002';
  }

  /**
   * Build full address string from components
   */
  private buildAddressString(components: {
    street?: string;
    postalCode?: string;
    city?: string;
    region?: string;
    country?: string;
  }): string {
    const parts: string[] = [];
    if (components.street) parts.push(components.street);
    if (components.postalCode) parts.push(components.postalCode);
    if (components.city) parts.push(components.city);
    if (components.region) parts.push(components.region);
    if (components.country) parts.push(components.country);
    return parts.join(', ');
  }

  /**
   * Geocode an address to coordinates
   * Returns null if geocoding fails or address is invalid
   */
  async geocode(address: string | {
    street?: string;
    postalCode?: string;
    city?: string;
    region?: string;
    country?: string;
  }, countryHint?: string): Promise<GeocodeResult | null> {
    try {
      // Build address string if object provided
      const addressString = typeof address === 'string'
        ? address
        : this.buildAddressString(address);

      if (!addressString || addressString.trim().length < 3) {
        this.logger.warn('Address too short for geocoding');
        return null;
      }

      // Extract country from address object if not provided as hint
      let countryCode: string | undefined = countryHint;
      if (typeof address === 'object' && address.country && !countryCode) {
        countryCode = address.country;
      }

      const url = `${this.geolocationServiceUrl}/geolocation/geocode`;
      const response = await this.httpService.axiosRef.post<GeocodeResult>(
        url,
        {
          address: addressString,
          country: countryCode,
        },
        {
          timeout: 5000, // 5 second timeout
        },
      );

      if (response.data && response.data.latitude && response.data.longitude) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Geocoding failed: ${error.message}`, error.stack);
      // Don't throw - geocoding failure shouldn't block property creation
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to an address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult | null> {
    try {
      const url = `${this.geolocationServiceUrl}/geolocation/reverse`;
      const response = await this.httpService.axiosRef.post<GeocodeResult>(
        url,
        { latitude, longitude },
        {
          timeout: 5000,
        },
      );

      if (response.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Reverse geocoding failed: ${error.message}`, error.stack);
      return null;
    }
  }
}

