import { Injectable, Logger } from '@nestjs/common';
import { MeilisearchService, PropertyDocument } from './meilisearch.service';

export interface SearchFilters {
  status?: string;
  type?: string;
  country?: string;
  city?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sort?: string[];
  language?: string; // For multilingual results (e.g., 'fr', 'en')
}

export interface SearchResult {
  properties: PropertyDocument[];
  total: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
  query: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private meilisearchService: MeilisearchService) {}

  /**
   * Search properties with query and filters
   */
  async searchProperties(
    query: string = '',
    filters?: SearchFilters,
    options?: SearchOptions,
  ): Promise<SearchResult> {
    try {
      const result = await this.meilisearchService.search(query, filters, {
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        sort: options?.sort,
        attributesToRetrieve: [
          'id',
          'userId',
          'status',
          'type',
          'price',
          'currency',
          'latitude',
          'longitude',
          'street',
          'postalCode',
          'city',
          'region',
          'country',
          'mediaUrls',
          'title',
          'description',
          'createdAt',
          'updatedAt',
          'publishedAt',
        ],
        attributesToHighlight: ['title', 'description'],
      });

      // Transform multilingual fields based on requested language
      const properties = this.transformMultilingualFields(
        result.hits,
        options?.language || 'fr',
      );

      return {
        properties,
        total: result.estimatedTotalHits,
        limit: result.limit,
        offset: result.offset,
        processingTimeMs: result.processingTimeMs,
        query: result.query,
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(
    query: string,
    limit: number = 5,
    language: string = 'fr',
  ): Promise<Array<{ id: string; title: string; city: string | null }>> {
    try {
      const suggestions = await this.meilisearchService.getSuggestions(query, limit);
      // Transform titles to use requested language
      return suggestions.map((suggestion) => {
        // Handle title which can be string, object, or null
        let titleValue: string = suggestion.title || '';
        if (typeof titleValue === 'object' && titleValue !== null) {
          // If title is an object (multilingual), extract the requested language
          const titleObj = titleValue as Record<string, string>;
          titleValue = (titleObj[language] || Object.values(titleObj)[0] || '') as string;
        }
        return {
          ...suggestion,
          title: titleValue,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to get suggestions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get facets for filter UI
   */
  async getFacets(
    query?: string,
    filters?: SearchFilters,
  ): Promise<{
    types: Array<{ value: string; count: number }>;
    countries: Array<{ value: string; count: number }>;
    cities: Array<{ value: string; count: number }>;
    priceRange: { min: number; max: number };
  }> {
    try {
      return await this.meilisearchService.getFacets(query, filters);
    } catch (error) {
      this.logger.error(`Failed to get facets: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transform multilingual fields to single language
   */
  private transformMultilingualFields(
    properties: PropertyDocument[],
    language: string,
  ): PropertyDocument[] {
    return properties.map((prop) => {
      // Get title in requested language or fallback
      const title =
        typeof prop.title === 'object'
          ? prop.title[language] || Object.values(prop.title)[0] || ''
          : prop.title || '';

      // Get description in requested language or fallback
      const description =
        typeof prop.description === 'object'
          ? prop.description[language] || Object.values(prop.description)[0] || ''
          : prop.description || '';

      return {
        ...prop,
        title: title as any, // Keep as object for compatibility, but could be string
        description: description as any,
      };
    });
  }
}

