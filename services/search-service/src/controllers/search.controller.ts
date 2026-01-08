import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { SearchService } from '../services/search.service';
import { MeilisearchService, PropertyDocument } from '../services/meilisearch.service';
import { SearchQueryDto, PropertyStatus } from '../dto/search-query.dto';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return this.meilisearchService.healthCheck();
  }

  /**
   * Simple search endpoint (GET)
   * GET /search?q=appartement&country=France&type=apartment&limit=20
   */
  @Get()
  async search(@Query() query: SearchQueryDto, @Headers('accept-language') acceptLanguage?: string) {
    // Extract language from Accept-Language header (e.g., "fr-FR,fr;q=0.9,en;q=0.8" -> "fr")
    const language = this.extractLanguage(acceptLanguage) || query.language || 'fr';

    // Default to LISTED status for public search
    const status = query.status || PropertyStatus.LISTED;

    const result = await this.searchService.searchProperties(
      query.q || '',
      {
        status,
        type: query.type,
        country: query.country,
        city: query.city,
        region: query.region,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        currency: query.currency,
        latitude: query.latitude,
        longitude: query.longitude,
        radiusKm: query.radiusKm,
      },
      {
        limit: query.limit || 20,
        offset: query.offset || 0,
        sort: query.sort,
        language,
      },
    );

    return result;
  }

  /**
   * Advanced search endpoint (POST)
   * POST /search
   * Body: { q: "appartement", filters: { ... }, options: { ... } }
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async advancedSearch(
    @Body() body: {
      q?: string;
      filters?: {
        status?: PropertyStatus;
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
      };
      options?: {
        limit?: number;
        offset?: number;
        sort?: string[];
        language?: string;
      };
    },
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const language =
      body.options?.language || this.extractLanguage(acceptLanguage) || 'fr';
    const status = body.filters?.status || PropertyStatus.LISTED;

    const result = await this.searchService.searchProperties(
      body.q || '',
      {
        status,
        ...body.filters,
      },
      {
        ...body.options,
        language,
      },
    );

    return result;
  }

  /**
   * Index a property (called by Property Service)
   * POST /search/index
   * Body: { property: PropertyDocument }
   */
  @Post('index')
  @HttpCode(HttpStatus.OK)
  async indexProperty(@Body() body: { property: PropertyDocument }) {
    if (!body.property || !body.property.id) {
      throw new BadRequestException('Property document is required');
    }

    await this.meilisearchService.indexProperty(body.property);
    return { success: true, propertyId: body.property.id };
  }

  /**
   * Delete a property from index
   * DELETE /search/index/:id
   */
  @Delete('index/:id')
  @HttpCode(HttpStatus.OK)
  async deleteProperty(@Param('id') id: string) {
    await this.meilisearchService.deleteProperty(id);
    return { success: true, propertyId: id };
  }

  /**
   * Get search suggestions (autocomplete)
   * GET /search/suggestions?q=appart&limit=5
   */
  @Get('suggestions')
  async getSuggestions(
    @Query('q') q: string,
    @Query('limit') limit?: string,
    @Query('language') language?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (!q || q.trim().length === 0) {
      throw new BadRequestException('Query parameter "q" is required');
    }

    const lang = language || this.extractLanguage(acceptLanguage) || 'fr';
    const limitNum = limit ? parseInt(limit, 10) : 5;

    return this.searchService.getSuggestions(q, limitNum, lang);
  }

  /**
   * Get facets for filter UI
   * GET /search/facets?q=appartement&country=France
   */
  @Get('facets')
  async getFacets(
    @Query('q') q?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const filters: any = {};
    if (country) filters.country = country;
    if (city) filters.city = city;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    return this.searchService.getFacets(q, filters);
  }

  /**
   * Extract language code from Accept-Language header
   * "fr-FR,fr;q=0.9,en;q=0.8" -> "fr"
   */
  private extractLanguage(acceptLanguage?: string): string | null {
    if (!acceptLanguage) {
      return null;
    }

    // Parse Accept-Language header
    // Format: "fr-FR,fr;q=0.9,en;q=0.8"
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [code, q] = lang.trim().split(';');
        const quality = q ? parseFloat(q.replace('q=', '')) : 1.0;
        return { code: code.split('-')[0].toLowerCase(), quality };
      })
      .sort((a, b) => b.quality - a.quality);

    return languages.length > 0 ? languages[0].code : null;
  }
}
