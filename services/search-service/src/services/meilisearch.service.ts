import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';

export interface PropertyDocument {
  id: string;
  userId: string;
  status: string;
  type: string;
  price: number;
  currency: string;
  latitude: number | null;
  longitude: number | null;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  mediaUrls: string[];
  // Multilingual fields - indexed by language code
  title: Record<string, string>; // { fr: "Titre", en: "Title" }
  description: Record<string, string>; // { fr: "Description", en: "Description" }
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliSearch;
  private readonly indexName = 'properties';

  constructor(private configService: ConfigService) {
    const meilisearchUrl =
      this.configService.get<string>('MEILISEARCH_URL') ||
      'http://localhost:7700';
    const meilisearchKey =
      this.configService.get<string>('MEILI_MASTER_KEY') || '';

    this.client = new MeiliSearch({
      host: meilisearchUrl,
      apiKey: meilisearchKey,
    });
  }

  async onModuleInit() {
    await this.initializeIndex();
  }

  /**
   * Initialize Meilisearch index with proper settings
   */
  private async initializeIndex() {
    try {
      const index = this.client.index(this.indexName);

      // Create index if it doesn't exist
      try {
        await index.getStats();
        this.logger.log(`Index "${this.indexName}" already exists`);
      } catch (error) {
        // Index doesn't exist, create it
        await this.client.createIndex(this.indexName, {
          primaryKey: 'id',
        });
        this.logger.log(`Created index "${this.indexName}"`);
      }

      // Configure index settings
      await index.updateSettings({
        // Searchable attributes (fields that can be searched)
        searchableAttributes: [
          'title',
          'description',
          'city',
          'country',
          'region',
          'street',
          'postalCode',
        ],
        // Filterable attributes (for WHERE clauses)
        filterableAttributes: [
          'status',
          'type',
          'country',
          'city',
          'region',
          'currency',
          'userId',
        ],
        // Sortable attributes
        sortableAttributes: ['price', 'createdAt', 'updatedAt', 'publishedAt'],
        // Attributes for faceting (for filters UI)
        faceting: {
          maxValuesPerFacet: 100,
        },
        // Ranking rules (relevance order)
        rankingRules: [
          'words',
          'typo',
          'proximity',
          'attribute',
          'sort',
          'exactness',
          'price:asc', // Lower price first (if sorted)
        ],
        // Geo attributes for location-based search
        // Note: Meilisearch v1.5+ supports _geo field
        // Format: { lat: number, lng: number } or { latitude: number, longitude: number }
      });

      // Update faceting settings
      await index.updateFaceting({
        maxValuesPerFacet: 100,
      });

      this.logger.log(`Index "${this.indexName}" settings configured`);
    } catch (error) {
      this.logger.error(`Failed to initialize Meilisearch index: ${error.message}`);
      throw error;
    }
  }

  /**
   * Index a single property document
   */
  async indexProperty(property: PropertyDocument): Promise<void> {
    try {
      const index = this.client.index(this.indexName);
      await index.addDocuments([property], { primaryKey: 'id' });
      this.logger.debug(`Indexed property: ${property.id}`);
    } catch (error) {
      this.logger.error(`Failed to index property ${property.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Index multiple property documents
   */
  async indexProperties(properties: PropertyDocument[]): Promise<void> {
    if (properties.length === 0) {
      return;
    }

    try {
      const index = this.client.index(this.indexName);
      await index.addDocuments(properties, { primaryKey: 'id' });
      this.logger.debug(`Indexed ${properties.length} properties`);
    } catch (error) {
      this.logger.error(`Failed to index properties: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an indexed property
   */
  async updateProperty(property: PropertyDocument): Promise<void> {
    try {
      const index = this.client.index(this.indexName);
      await index.updateDocuments([property], { primaryKey: 'id' });
      this.logger.debug(`Updated property in index: ${property.id}`);
    } catch (error) {
      this.logger.error(`Failed to update property ${property.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a property from index
   */
  async deleteProperty(propertyId: string): Promise<void> {
    try {
      const index = this.client.index(this.indexName);
      await index.deleteDocument(propertyId);
      this.logger.debug(`Deleted property from index: ${propertyId}`);
    } catch (error) {
      this.logger.error(`Failed to delete property ${propertyId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search properties with query and filters
   */
  async search(
    query: string,
    filters?: {
      status?: string;
      type?: string;
      country?: string;
      city?: string;
      minPrice?: number;
      maxPrice?: number;
      currency?: string;
      latitude?: number;
      longitude?: number;
      radiusKm?: number;
      bbox?: { minLat: number; minLon: number; maxLat: number; maxLon: number };
    },
    options?: {
      limit?: number;
      offset?: number;
      sort?: string[];
      attributesToHighlight?: string[];
      attributesToRetrieve?: string[];
    },
  ): Promise<{
    hits: PropertyDocument[];
    estimatedTotalHits: number;
    processingTimeMs: number;
    query: string;
    limit: number;
    offset: number;
  }> {
    try {
      const index = this.client.index(this.indexName);
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;

      // Build filter string for Meilisearch
      const filterParts: string[] = [];

      if (filters?.status) {
        filterParts.push(`status = "${filters.status}"`);
      }

      if (filters?.type) {
        filterParts.push(`type = "${filters.type}"`);
      }

      if (filters?.country) {
        filterParts.push(`country = "${filters.country}"`);
      }

      if (filters?.city) {
        filterParts.push(`city = "${filters.city}"`);
      }

      if (filters?.currency) {
        filterParts.push(`currency = "${filters.currency}"`);
      }

      if (filters?.minPrice !== undefined) {
        filterParts.push(`price >= ${filters.minPrice}`);
      }

      if (filters?.maxPrice !== undefined) {
        filterParts.push(`price <= ${filters.maxPrice}`);
      }

      // Geo search (if latitude/longitude provided)
      // Note: Meilisearch geo search uses _geo field with lat/lng format
      if (filters?.latitude && filters?.longitude && filters?.radiusKm) {
        // Meilisearch geo search format: _geoRadius(lat, lng, radius_in_meters)
        const radiusMeters = filters.radiusKm * 1000;
        filterParts.push(
          `_geoRadius(${filters.latitude}, ${filters.longitude}, ${radiusMeters})`,
        );
      }

      // Bounding box filter (alternative to radius search)
      if (filters?.bbox) {
        // Meilisearch bounding box format: _geoBoundingBox([minLat, minLon], [maxLat, maxLon])
        filterParts.push(
          `_geoBoundingBox([${filters.bbox.minLat}, ${filters.bbox.minLon}], [${filters.bbox.maxLat}, ${filters.bbox.maxLon}])`,
        );
      }

      const filterString = filterParts.length > 0 ? filterParts.join(' AND ') : undefined;

      // Execute search
      const searchResult = await index.search(query || '', {
        limit,
        offset,
        filter: filterString,
        sort: options?.sort || ['price:asc'],
        attributesToHighlight: options?.attributesToHighlight || ['title', 'description'],
        attributesToRetrieve: options?.attributesToRetrieve,
        // Show ranking score for debugging
        showRankingScore: false,
      });

      return {
        hits: searchResult.hits as PropertyDocument[],
        estimatedTotalHits: searchResult.estimatedTotalHits,
        processingTimeMs: searchResult.processingTimeMs,
        query: query || '',
        limit,
        offset,
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
  ): Promise<Array<{ id: string; title: string; city: string | null }>> {
    try {
      const index = this.client.index(this.indexName);
      const searchResult = await index.search(query, {
        limit,
        attributesToRetrieve: ['id', 'title', 'city'],
        filter: 'status = "listed"', // Only suggest listed properties
      });

      return searchResult.hits.map((hit: any) => ({
        id: hit.id,
        title: hit.title || Object.values(hit.title || {})[0] || '',
        city: hit.city || null,
      }));
    } catch (error) {
      this.logger.error(`Failed to get suggestions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get facets (for filter UI)
   */
  async getFacets(
    query?: string,
    filters?: {
      country?: string;
      city?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ): Promise<{
    types: Array<{ value: string; count: number }>;
    countries: Array<{ value: string; count: number }>;
    cities: Array<{ value: string; count: number }>;
    priceRange: { min: number; max: number };
  }> {
    try {
      const index = this.client.index(this.indexName);
      const filterParts: string[] = ['status = "listed"'];

      if (filters?.country) {
        filterParts.push(`country = "${filters.country}"`);
      }

      if (filters?.city) {
        filterParts.push(`city = "${filters.city}"`);
      }

      if (filters?.minPrice !== undefined) {
        filterParts.push(`price >= ${filters.minPrice}`);
      }

      if (filters?.maxPrice !== undefined) {
        filterParts.push(`price <= ${filters.maxPrice}`);
      }

      // Get all properties matching filters to compute facets
      const searchResult = await index.search(query || '', {
        limit: 1000, // Get enough to compute facets
        filter: filterParts.join(' AND '),
        attributesToRetrieve: ['type', 'country', 'city', 'price'],
      });

      // Compute facets manually from results
      const typesMap = new Map<string, number>();
      const countriesMap = new Map<string, number>();
      const citiesMap = new Map<string, number>();
      let minPrice = Infinity;
      let maxPrice = -Infinity;

      searchResult.hits.forEach((hit: any) => {
        // Type facet
        if (hit.type) {
          typesMap.set(hit.type, (typesMap.get(hit.type) || 0) + 1);
        }

        // Country facet
        if (hit.country) {
          countriesMap.set(hit.country, (countriesMap.get(hit.country) || 0) + 1);
        }

        // City facet
        if (hit.city) {
          citiesMap.set(hit.city, (citiesMap.get(hit.city) || 0) + 1);
        }

        // Price range
        if (hit.price !== undefined && hit.price !== null) {
          minPrice = Math.min(minPrice, hit.price);
          maxPrice = Math.max(maxPrice, hit.price);
        }
      });

      return {
        types: Array.from(typesMap.entries()).map(([value, count]) => ({ value, count })),
        countries: Array.from(countriesMap.entries()).map(([value, count]) => ({
          value,
          count,
        })),
        cities: Array.from(citiesMap.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20), // Top 20 cities
        priceRange: {
          min: minPrice === Infinity ? 0 : minPrice,
          max: maxPrice === -Infinity ? 0 : maxPrice,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get facets: ${error.message}`);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; meilisearch: string }> {
    try {
      const health = await this.client.health();
      return {
        status: 'ok',
        meilisearch: health.status === 'available' ? 'connected' : 'disconnected',
      };
    } catch (error) {
      return {
        status: 'error',
        meilisearch: 'disconnected',
      };
    }
  }
}

