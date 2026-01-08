import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

export interface NearbyProperty {
  id: string;
  type: string;
  price: number;
  currency: string;
  latitude: number;
  longitude: number;
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
  translations?: Array<{
    language: string;
    title: string;
    description?: string;
  }>;
}

export interface NearbySearchResult {
  properties: NearbyProperty[];
  total: number;
}

@Injectable()
export class PropertyClientService {
  private readonly logger = new Logger(PropertyClientService.name);
  private readonly propertyServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Get property service URL from env or use default
    this.propertyServiceUrl =
      this.configService.get<string>('PROPERTY_SERVICE_URL') ||
      process.env.PROPERTY_SERVICE_URL ||
      'http://property-service:3001';
  }

  /**
   * Find properties within a radius
   * Used by Geolocation Service for /search/nearby endpoint
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit = 20,
    offset = 0,
    status?: string,
  ): Promise<NearbySearchResult | null> {
    try {
      const url = `${this.propertyServiceUrl}/properties/search/nearby`;
      const response = await this.httpService.axiosRef.get<NearbySearchResult>(
        url,
        {
          params: {
            latitude,
            longitude,
            radiusKm,
            limit,
            offset,
            status,
          },
          timeout: 5000,
        },
      );

      return response.data || { properties: [], total: 0 };
    } catch (error: any) {
      this.logger.error(`Failed to query Property Service: ${error.message}`, error.stack);
      // Return empty result instead of throwing - don't break geolocation service
      return { properties: [], total: 0 };
    }
  }
}

