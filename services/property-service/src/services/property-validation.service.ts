import { Injectable, BadRequestException } from '@nestjs/common';
import { Property, PropertyStatus } from '../entities/property.entity';
import { PropertyTranslation } from '../entities/property-translation.entity';

@Injectable()
export class PropertyValidationService {
  /**
   * Validate property is ready for publication
   * Checks all required fields are present and valid
   */
  validateForPublication(
    property: Property,
    translations: PropertyTranslation[],
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check translations exist
    if (!translations || translations.length === 0) {
      errors.push('Property must have at least one translation');
    } else {
      // Check at least one translation has required fields
      const hasValidTranslation = translations.some(
        (t) => t.title && t.title.trim().length >= 3,
      );
      if (!hasValidTranslation) {
        errors.push('At least one translation must have a valid title (min 3 characters)');
      }
    }

    // Check price is valid
    if (!property.price || property.price <= 0) {
      errors.push('Property must have a valid price greater than 0');
    }

    // Check currency is set
    if (!property.currency) {
      errors.push('Property must have a currency');
    }

    // Check address or coordinates
    const hasAddress =
      property.street || property.city || property.postalCode || property.country;
    const hasCoordinates = property.latitude != null && property.longitude != null;

    if (!hasAddress && !hasCoordinates) {
      errors.push('Property must have either an address or coordinates (latitude/longitude)');
    }

    // Check property type is set
    if (!property.type) {
      errors.push('Property must have a type');
    }

    // Check coordinates are valid if provided
    if (hasCoordinates) {
      if (
        property.latitude! < -90 ||
        property.latitude! > 90 ||
        property.longitude! < -180 ||
        property.longitude! > 180
      ) {
        errors.push('Property coordinates are out of valid range');
      }
    }

    // Check country code format if provided
    if (property.country && !/^[A-Z]{2}$/.test(property.country)) {
      errors.push('Country must be a valid ISO 3166-1 alpha-2 code (e.g., "FR", "US")');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate media URLs
   */
  validateMediaUrls(mediaUrls: string[] | null | undefined): string[] {
    if (!mediaUrls || mediaUrls.length === 0) {
      return [];
    }

    const errors: string[] = [];
    const maxUrls = 20; // Limit to 20 media URLs per property

    if (mediaUrls.length > maxUrls) {
      errors.push(`Maximum ${maxUrls} media URLs allowed`);
    }

    mediaUrls.forEach((url, index) => {
      try {
        new URL(url);
        // Check URL scheme
        if (!['http:', 'https:'].includes(new URL(url).protocol)) {
          errors.push(`Media URL at index ${index} must use HTTP or HTTPS`);
        }
      } catch {
        errors.push(`Media URL at index ${index} is not a valid URL`);
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid media URLs: ${errors.join(', ')}`);
    }

    return mediaUrls;
  }

  /**
   * Validate price based on currency
   */
  validatePrice(price: number, currency: string): void {
    if (price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // Currency-specific validations
    const currencyLimits: Record<string, { min: number; max: number }> = {
      EUR: { min: 0.01, max: 999999999 },
      USD: { min: 0.01, max: 999999999 },
      GBP: { min: 0.01, max: 999999999 },
      JPY: { min: 1, max: 999999999999 }, // No decimals for JPY
      CNY: { min: 0.01, max: 999999999 },
    };

    const limits = currencyLimits[currency];
    if (limits) {
      if (price < limits.min) {
        throw new BadRequestException(
          `Price for ${currency} must be at least ${limits.min}`,
        );
      }
      if (price > limits.max) {
        throw new BadRequestException(
          `Price for ${currency} exceeds maximum of ${limits.max}`,
        );
      }

      // JPY doesn't use decimals
      if (currency === 'JPY' && price % 1 !== 0) {
        throw new BadRequestException('Price for JPY must be a whole number');
      }
    }
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(latitude?: number, longitude?: number): void {
    if (latitude !== undefined) {
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new BadRequestException('Latitude must be between -90 and 90');
      }
    }

    if (longitude !== undefined) {
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new BadRequestException('Longitude must be between -180 and 180');
      }
    }

    // If one is provided, both should be provided
    if (
      (latitude !== undefined && longitude === undefined) ||
      (latitude === undefined && longitude !== undefined)
    ) {
      throw new BadRequestException(
        'Both latitude and longitude must be provided together',
      );
    }
  }
}

