import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property, PropertyStatus, PropertyType } from '../entities/property.entity';
import { PropertyStatisticsDto } from '../dto/property-statistics.dto';

@Injectable()
export class PropertyStatisticsService {
  private readonly logger = new Logger(PropertyStatisticsService.name);

  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  /**
   * Get comprehensive statistics for properties
   */
  async getStatistics(userId?: string): Promise<PropertyStatisticsDto> {
    const baseWhere = userId ? { userId, deletedAt: null } : { deletedAt: null };
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Create separate query builders for each query (query builders are mutable)
    const createBaseQuery = () => {
      const qb = this.propertyRepo.createQueryBuilder('property').where('property.deleted_at IS NULL');
      if (userId) {
        qb.andWhere('property.user_id = :userId', { userId });
      }
      return qb;
    };

    // Execute all queries in parallel for better performance
    const [
      total,
      byStatus,
      byType,
      byCountry,
      byCity,
      priceStats,
      currencyDistribution,
      recentlyPublished,
      recentlyCreated,
      withImages,
      withCoordinates,
    ] = await Promise.all([
      // Total count
      this.propertyRepo.count({ where: baseWhere }),

      // By status
      createBaseQuery()
        .select('property.statusCode', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('property.statusCode')
        .getRawMany(),

      // By type
      createBaseQuery()
        .select('property.typeCode', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('property.typeCode')
        .getRawMany(),

      // By country
      createBaseQuery()
        .select('property.country', 'country')
        .addSelect('COUNT(*)', 'count')
        .andWhere('property.country IS NOT NULL')
        .groupBy('property.country')
        .orderBy('count', 'DESC')
        .limit(20)
        .getRawMany(),

      // By city
      createBaseQuery()
        .select('property.city', 'city')
        .addSelect('property.country', 'country')
        .addSelect('COUNT(*)', 'count')
        .andWhere('property.city IS NOT NULL')
        .groupBy('property.city')
        .addGroupBy('property.country')
        .orderBy('count', 'DESC')
        .limit(20)
        .getRawMany(),

      // Price statistics (median calculated separately)
      createBaseQuery()
        .select('MIN(property.price)', 'min')
        .addSelect('MAX(property.price)', 'max')
        .addSelect('AVG(property.price)', 'avg')
        .getRawOne(),

      // Currency distribution
      createBaseQuery()
        .select('property.currency', 'currency')
        .addSelect('COUNT(*)', 'count')
        .andWhere('property.currency IS NOT NULL')
        .groupBy('property.currency')
        .orderBy('count', 'DESC')
        .getRawMany(),

      // Recently published (last 7 days)
      createBaseQuery()
        .andWhere('property.published_at >= :sevenDaysAgo', { sevenDaysAgo })
        .andWhere('property.status_code = :listedStatus', { listedStatus: PropertyStatus.LISTED })
        .getCount(),

      // Recently created (last 7 days)
      createBaseQuery()
        .andWhere('property.created_at >= :sevenDaysAgo', { sevenDaysAgo })
        .getCount(),

      // With images
      createBaseQuery()
        .andWhere("property.media_urls IS NOT NULL AND property.media_urls != '[]'::jsonb")
        .getCount(),

      // With coordinates
      createBaseQuery()
        .andWhere('property.latitude IS NOT NULL AND property.longitude IS NOT NULL')
        .getCount(),
    ]);

    // Format byStatus
    const statusMap: Record<string, number> = {};
    byStatus.forEach((item: any) => {
      statusMap[item.status] = parseInt(item.count, 10);
    });

    // Format byType
    const typeMap: Record<string, number> = {};
    byType.forEach((item: any) => {
      typeMap[item.type] = parseInt(item.count, 10);
    });

    // Calculate median separately (TypeORM doesn't support PERCENTILE_CONT directly)
    const allPrices = await createBaseQuery()
      .select('property.price', 'price')
      .orderBy('property.price', 'ASC')
      .getRawMany();
    
    const prices = allPrices.map((item: any) => parseFloat(item.price)).sort((a, b) => a - b);
    const median = prices.length > 0
      ? prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)]
      : 0;

    // Format price statistics
    const priceRange = {
      min: priceStats?.min ? parseFloat(priceStats.min) : 0,
      max: priceStats?.max ? parseFloat(priceStats.max) : 0,
      average: priceStats?.avg ? parseFloat(priceStats.avg) : 0,
      median,
    };

    return {
      total,
      byStatus: {
        draft: statusMap[PropertyStatus.DRAFT] || 0,
        review: statusMap[PropertyStatus.REVIEW] || 0,
        listed: statusMap[PropertyStatus.LISTED] || 0,
        flagged: statusMap[PropertyStatus.FLAGGED] || 0,
        archived: statusMap[PropertyStatus.ARCHIVED] || 0,
      },
      byType: {
        house: typeMap[PropertyType.HOUSE] || 0,
        apartment: typeMap[PropertyType.APARTMENT] || 0,
        villa: typeMap[PropertyType.VILLA] || 0,
        land: typeMap[PropertyType.LAND] || 0,
        commercial: typeMap[PropertyType.COMMERCIAL] || 0,
        other: typeMap[PropertyType.OTHER] || 0,
      },
      byCountry: byCountry.map((item: any) => ({
        country: item.country,
        count: parseInt(item.count, 10),
      })),
      byCity: byCity.map((item: any) => ({
        city: item.city,
        country: item.country,
        count: parseInt(item.count, 10),
      })),
      priceRange,
      currencyDistribution: currencyDistribution.map((item: any) => ({
        currency: item.currency,
        count: parseInt(item.count, 10),
      })),
      recentlyPublished,
      recentlyCreated,
      withImages,
      withCoordinates,
    };
  }

  /**
   * Get statistics for a specific date range
   */
  async getStatisticsByDateRange(
    startDate: Date,
    endDate: Date,
    userId?: string,
  ): Promise<Partial<PropertyStatisticsDto>> {
    const queryBuilder = this.propertyRepo
      .createQueryBuilder('property')
      .where('property.deleted_at IS NULL')
      .andWhere('property.created_at >= :startDate', { startDate })
      .andWhere('property.created_at <= :endDate', { endDate });

    if (userId) {
      queryBuilder.andWhere('property.user_id = :userId', { userId });
    }

    const total = await queryBuilder.getCount();

    const byStatus = await queryBuilder
      .select('property.statusCode', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('property.statusCode')
      .getRawMany();

    const statusMap: Record<string, number> = {};
    byStatus.forEach((item: any) => {
      statusMap[item.status] = parseInt(item.count, 10);
    });

    return {
      total,
      byStatus: {
        draft: statusMap[PropertyStatus.DRAFT] || 0,
        review: statusMap[PropertyStatus.REVIEW] || 0,
        listed: statusMap[PropertyStatus.LISTED] || 0,
        flagged: statusMap[PropertyStatus.FLAGGED] || 0,
        archived: statusMap[PropertyStatus.ARCHIVED] || 0,
      },
    };
  }
}

