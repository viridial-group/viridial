import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Property, PropertyStatus } from '../entities/property.entity';
import { PropertyTranslation } from '../entities/property-translation.entity';

/**
 * Service for indexing properties in Meilisearch via Search Service
 * This service calls the Search Service API to index/update/delete properties
 */
@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);
  private readonly searchServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.searchServiceUrl =
      this.configService.get<string>('SEARCH_SERVICE_URL') ||
      'http://search-service:3003';
  }

  /**
   * Index a property (or update if exists)
   * Called when a property is published or updated
   */
  async indexProperty(
    property: Property,
    translations: PropertyTranslation[],
  ): Promise<void> {
    // Only index LISTED properties
    if (property.status !== PropertyStatus.LISTED) {
      this.logger.debug(
        `Skipping index for property ${property.id} - status is ${property.status}`,
      );
      return;
    }

    try {
      // Transform property to Meilisearch document format
      const document = this.transformToDocument(property, translations);

      // Call Search Service to index
      await firstValueFrom(
        this.httpService.post(
          `${this.searchServiceUrl}/search/index`,
          { property: document },
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.debug(`Indexed property: ${property.id}`);
    } catch (error: any) {
      // Log error but don't throw - indexing is not critical for property operations
      this.logger.warn(
        `Failed to index property ${property.id}: ${error.message}`,
      );
      // In production, you might want to queue this for retry
    }
  }

  /**
   * Delete a property from search index
   */
  async deleteProperty(propertyId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.searchServiceUrl}/search/index/${propertyId}`, {
          timeout: 5000,
        }),
      );

      this.logger.debug(`Deleted property from index: ${propertyId}`);
    } catch (error: any) {
      this.logger.warn(
        `Failed to delete property ${propertyId} from index: ${error.message}`,
      );
    }
  }

  /**
   * Transform Property entity to Meilisearch document format
   */
  private transformToDocument(
    property: Property,
    translations: PropertyTranslation[],
  ): any {
    // Build multilingual title and description objects
    const titleMap: Record<string, string> = {};
    const descriptionMap: Record<string, string> = {};

    translations.forEach((trans) => {
      if (trans.title) {
        titleMap[trans.language] = trans.title;
      }
      if (trans.description) {
        descriptionMap[trans.language] = trans.description;
      }
    });

    // Build geo point for Meilisearch (if coordinates available)
    const _geo: { lat: number; lng: number } | null =
      property.latitude && property.longitude
        ? {
            lat: property.latitude,
            lng: property.longitude,
          }
        : null;

    return {
      id: property.id,
      userId: property.userId,
      status: property.status,
      type: property.type,
      price: property.price,
      currency: property.currency || 'EUR',
      latitude: property.latitude,
      longitude: property.longitude,
      _geo, // Meilisearch geo field format
      street: property.street,
      postalCode: property.postalCode,
      city: property.city,
      region: property.region,
      country: property.country,
      mediaUrls: property.mediaUrls || [],
      title: titleMap, // Multilingual: { fr: "Titre", en: "Title" }
      description: descriptionMap, // Multilingual: { fr: "Description", en: "Description" }
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
      publishedAt: property.publishedAt
        ? property.publishedAt.toISOString()
        : undefined,
    };
  }
}

