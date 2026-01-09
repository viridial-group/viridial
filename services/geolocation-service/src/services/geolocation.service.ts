import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IGeocodingProvider, GeocodeResult, ReverseGeocodeResult } from '../interfaces/geocoding-provider.interface';
import { BatchGeocodeItemDto } from '../dto/batch-geocode.dto';
import { GoogleProviderService } from '../providers/google-provider.service';
import { NominatimProviderService } from '../providers/nominatim-provider.service';
import { StubProviderService } from '../providers/stub-provider.service';

@Injectable()
export class GeolocationService {
  private readonly provider: IGeocodingProvider;
  private readonly cacheTtl: number; // Cache TTL in seconds

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly googleProvider: GoogleProviderService,
    private readonly nominatimProvider: NominatimProviderService,
    private readonly stubProvider: StubProviderService,
  ) {
    // Select provider based on environment
    const providerName = process.env.GEOCODING_PROVIDER || 'stub';
    this.provider = this.selectProvider(providerName);
    this.cacheTtl = parseInt(process.env.GEOCODING_CACHE_TTL || '86400', 10); // 24 hours default

    console.log(`Geolocation service initialized with provider: ${this.provider.name}`);
  }

  private selectProvider(name: string): IGeocodingProvider {
    switch (name.toLowerCase()) {
      case 'google':
        if (!process.env.GOOGLE_MAPS_API_KEY) {
          console.warn('Google Maps API key not set, falling back to stub provider');
          return this.stubProvider;
        }
        return this.googleProvider;
      case 'nominatim':
        return this.nominatimProvider;
      case 'stub':
      default:
        return this.stubProvider;
    }
  }

  /**
   * Normalize address for cache key
   */
  private normalizeAddress(address: string): string {
    return address.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Generate cache key for geocode
   */
  private getGeocodeCacheKey(address: string, countryHint?: string): string {
    const normalized = this.normalizeAddress(address);
    return countryHint
      ? `geocode:${normalized}:${countryHint.toLowerCase()}`
      : `geocode:${normalized}`;
  }

  /**
   * Generate cache key for reverse geocode
   */
  private getReverseGeocodeCacheKey(lat: number, lon: number): string {
    // Round to 4 decimal places (~11 meters precision) for cache efficiency
    const latRounded = lat.toFixed(4);
    const lonRounded = lon.toFixed(4);
    return `reverse:${latRounded}:${lonRounded}`;
  }

  /**
   * Geocode an address to coordinates
   */
  async geocode(address: string, countryHint?: string): Promise<GeocodeResult | null> {
    const cacheKey = this.getGeocodeCacheKey(address, countryHint);

    // Try cache first
    const cached = await this.cacheManager.get<GeocodeResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Call provider
    const result = await this.provider.geocode(address, countryHint);

    // Cache result if found
    if (result) {
      await this.cacheManager.set(cacheKey, result, this.cacheTtl * 1000); // TTL in milliseconds
    }

    return result;
  }

  /**
   * Reverse geocode coordinates to an address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult | null> {
    const cacheKey = this.getReverseGeocodeCacheKey(latitude, longitude);

    // Try cache first
    const cached = await this.cacheManager.get<ReverseGeocodeResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Call provider
    const result = await this.provider.reverseGeocode(latitude, longitude);

    // Cache result if found
    if (result) {
      await this.cacheManager.set(cacheKey, result, this.cacheTtl * 1000);
    }

    return result;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * Returns distance in kilometers
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Batch geocode multiple addresses
   */
  async batchGeocode(
    addresses: BatchGeocodeItemDto[],
  ): Promise<Array<{ id: string; result: GeocodeResult | null; error?: string }>> {
    const results = [];

    for (const item of addresses) {
      try {
        const result = await this.geocode(item.address, item.country);
        results.push({ id: item.id, result });
      } catch (error: any) {
        results.push({
          id: item.id,
          result: null,
          error: error.message || 'Geocoding failed',
        });
      }
    }

    return results;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

