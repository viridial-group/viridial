import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PropertyFavorite } from '../entities/property-favorite.entity';
import { Property } from '../entities/property.entity';

@Injectable()
export class PropertyFavoriteService {
  private readonly logger = new Logger(PropertyFavoriteService.name);

  constructor(
    @InjectRepository(PropertyFavorite)
    private favoriteRepo: Repository<PropertyFavorite>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  /**
   * Add a property to favorites
   */
  async addFavorite(propertyId: string, userId: string): Promise<PropertyFavorite> {
    // Verify property exists
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Check if already favorited
    const existing = await this.favoriteRepo.findOne({
      where: { userId, propertyId },
    });

    if (existing) {
      throw new BadRequestException('Property is already in favorites');
    }

    // Create favorite
    const favorite = this.favoriteRepo.create({
      userId,
      propertyId,
    });

    const saved = await this.favoriteRepo.save(favorite);
    this.logger.log(`Property ${propertyId} added to favorites for user ${userId}`);

    return saved;
  }

  /**
   * Remove a property from favorites
   */
  async removeFavorite(propertyId: string, userId: string): Promise<void> {
    const favorite = await this.favoriteRepo.findOne({
      where: { userId, propertyId },
    });

    if (!favorite) {
      throw new NotFoundException('Property is not in favorites');
    }

    await this.favoriteRepo.remove(favorite);
    this.logger.log(`Property ${propertyId} removed from favorites for user ${userId}`);
  }

  /**
   * Check if a property is favorited by a user
   */
  async isFavorited(propertyId: string, userId: string): Promise<boolean> {
    const favorite = await this.favoriteRepo.findOne({
      where: { userId, propertyId },
    });

    return !!favorite;
  }

  /**
   * Get all favorite properties for a user
   */
  async getUserFavorites(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ favorites: PropertyFavorite[]; total: number }> {
    const queryBuilder = this.favoriteRepo
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.property', 'property')
      .leftJoinAndSelect('property.translations', 'translation')
      .leftJoinAndSelect('property.neighborhood', 'neighborhood')
      .where('favorite.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL'); // Exclude deleted properties
    
    // Use property name - TypeORM will map to column name via entity metadata
    queryBuilder.addOrderBy('favorite.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const favorites = await queryBuilder.take(limit).skip(offset).getMany();

    return { favorites, total };
  }

  /**
   * Get favorite property IDs for a user (lightweight)
   */
  async getUserFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await this.favoriteRepo.find({
      where: { userId },
      select: ['propertyId'],
    });

    return favorites.map((f) => f.propertyId);
  }

  /**
   * Get count of favorites for a property
   */
  async getFavoriteCount(propertyId: string): Promise<number> {
    return await this.favoriteRepo.count({
      where: { propertyId },
    });
  }

  /**
   * Get multiple properties with favorite status for a user
   */
  async markFavoritesForUser(propertyIds: string[], userId: string): Promise<Record<string, boolean>> {
    if (propertyIds.length === 0) {
      return {};
    }

    const favorites = await this.favoriteRepo.find({
      where: {
        propertyId: In(propertyIds),
        userId,
      },
    });

    const favoriteMap: Record<string, boolean> = {};
    propertyIds.forEach((id) => {
      favoriteMap[id] = favorites.some((f) => f.propertyId === id);
    });

    return favoriteMap;
  }
}

