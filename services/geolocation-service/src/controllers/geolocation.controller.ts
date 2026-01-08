import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GeolocationService } from '../services/geolocation.service';
import { PropertyClientService } from '../services/property-client.service';
import {
  GeocodeDto,
  ReverseGeocodeDto,
  DistanceDto,
  NearbySearchDto,
} from '../dto/geocode.dto';
import { BatchGeocodeDto } from '../dto/batch-geocode.dto';

@Controller('geolocation')
export class GeolocationController {
  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly propertyClient: PropertyClientService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'geolocation-service',
      provider: process.env.GEOCODING_PROVIDER || 'stub',
    };
  }

  @Post('geocode')
  async geocode(@Body() dto: GeocodeDto) {
    try {
      const result = await this.geolocationService.geocode(dto.address, dto.country);
      if (!result) {
        throw new HttpException('Address not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Geocoding failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reverse')
  async reverseGeocode(@Body() dto: ReverseGeocodeDto) {
    try {
      const result = await this.geolocationService.reverseGeocode(
        dto.latitude,
        dto.longitude,
      );
      if (!result) {
        throw new HttpException('Location not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Reverse geocoding failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('distance')
  async calculateDistance(@Query() dto: DistanceDto) {
    try {
      const distance = this.geolocationService.calculateDistance(
        dto.lat1,
        dto.lon1,
        dto.lat2,
        dto.lon2,
      );
      return {
        distanceKm: parseFloat(distance.toFixed(2)),
        point1: { latitude: dto.lat1, longitude: dto.lon1 },
        point2: { latitude: dto.lat2, longitude: dto.lon2 },
      };
    } catch (error: any) {
      throw new HttpException(
        `Distance calculation failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('batch')
  async batchGeocode(@Body() dto: BatchGeocodeDto) {
    try {
      const results = await this.geolocationService.batchGeocode(dto.addresses);
      const successCount = results.filter((r) => r.result !== null).length;
      const failureCount = results.length - successCount;

      return {
        total: results.length,
        success: successCount,
        failures: failureCount,
        results,
      };
    } catch (error: any) {
      throw new HttpException(
        `Batch geocoding failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Nearby search - returns properties within radius
   * Integrates with Property Service to find listed properties
   */
  @Post('search/nearby')
  async searchNearby(@Body() dto: NearbySearchDto) {
    try {
      const result = await this.propertyClient.findNearby(
        dto.latitude,
        dto.longitude,
        dto.radiusKm,
        dto.limit || 20,
        dto.offset || 0,
        'listed', // Default to listed properties only
      );

      if (!result) {
        return {
          center: { latitude: dto.latitude, longitude: dto.longitude },
          radiusKm: dto.radiusKm,
          limit: dto.limit || 20,
          offset: dto.offset || 0,
          results: [],
          total: 0,
        };
      }

      // Calculate distance for each property and enrich results
      const enrichedResults = result.properties.map((property) => {
        const distance = this.geolocationService.calculateDistance(
          dto.latitude,
          dto.longitude,
          Number(property.latitude),
          Number(property.longitude),
        );

        return {
          ...property,
          distanceKm: parseFloat(distance.toFixed(2)),
        };
      });

      // Sort by distance (closest first)
      enrichedResults.sort((a, b) => a.distanceKm - b.distanceKm);

      return {
        center: { latitude: dto.latitude, longitude: dto.longitude },
        radiusKm: dto.radiusKm,
        limit: dto.limit || 20,
        offset: dto.offset || 0,
        results: enrichedResults,
        total: result.total,
      };
    } catch (error: any) {
      throw new HttpException(
        `Nearby search failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

