import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Neighborhood } from '../entities/neighborhood.entity';
import { CreateNeighborhoodDto } from '../dto/create-neighborhood.dto';
import { UpdateNeighborhoodDto } from '../dto/update-neighborhood.dto';
import { Property } from '../entities/property.entity';

@Injectable()
export class NeighborhoodService {
  constructor(
    @InjectRepository(Neighborhood)
    private neighborhoodRepository: Repository<Neighborhood>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async create(createDto: CreateNeighborhoodDto): Promise<Neighborhood> {
    const neighborhood = this.neighborhoodRepository.create(createDto);
    return await this.neighborhoodRepository.save(neighborhood);
  }

  async findAll(filters?: {
    city?: string;
    region?: string;
    country?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Neighborhood[]; total: number }> {
    const query = this.neighborhoodRepository.createQueryBuilder('neighborhood');

    if (filters?.city) {
      query.andWhere('neighborhood.city = :city', { city: filters.city });
    }
    if (filters?.region) {
      query.andWhere('neighborhood.region = :region', { region: filters.region });
    }
    if (filters?.country) {
      query.andWhere('neighborhood.country = :country', { country: filters.country });
    }

    const total = await query.getCount();

    if (filters?.limit) {
      query.limit(filters.limit);
    }
    if (filters?.offset) {
      query.offset(filters.offset);
    }

    query.orderBy('neighborhood.name', 'ASC');

    const data = await query.getMany();
    return { data, total };
  }

  async findOne(id: string): Promise<Neighborhood> {
    const neighborhood = await this.neighborhoodRepository.findOne({
      where: { id },
      relations: ['properties'],
    });

    if (!neighborhood) {
      throw new NotFoundException(`Neighborhood with ID ${id} not found`);
    }

    return neighborhood;
  }

  async findBySlug(slug: string): Promise<Neighborhood> {
    const neighborhood = await this.neighborhoodRepository.findOne({
      where: { slug },
      relations: ['properties'],
    });

    if (!neighborhood) {
      throw new NotFoundException(`Neighborhood with slug ${slug} not found`);
    }

    return neighborhood;
  }

  async update(id: string, updateDto: UpdateNeighborhoodDto): Promise<Neighborhood> {
    const neighborhood = await this.findOne(id);
    Object.assign(neighborhood, updateDto);
    return await this.neighborhoodRepository.save(neighborhood);
  }

  async remove(id: string): Promise<void> {
    const neighborhood = await this.findOne(id);
    await this.neighborhoodRepository.remove(neighborhood);
  }

  /**
   * Calcule et met à jour les statistiques d'un quartier basées sur ses propriétés
   */
  async updateStats(neighborhoodId: string): Promise<Neighborhood> {
    const neighborhood = await this.findOne(neighborhoodId);
    
    const properties = await this.propertyRepository.find({
      where: {
        neighborhoodId,
        status: 'listed' as any,
      },
    });

    if (properties.length === 0) {
      neighborhood.stats = {
        propertyCount: 0,
        lastUpdated: new Date().toISOString(),
      };
      return await this.neighborhoodRepository.save(neighborhood);
    }

    const prices = properties.map(p => parseFloat(p.price.toString()));
    const pricesByType: Record<string, number[]> = {};

    properties.forEach(prop => {
      const type = prop.type;
      if (!pricesByType[type]) {
        pricesByType[type] = [];
      }
      pricesByType[type].push(parseFloat(prop.price.toString()));
    });

    const calculateAverage = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const calculateMedian = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const averagePrice: Record<string, number> = {};
    Object.keys(pricesByType).forEach(type => {
      averagePrice[type] = calculateAverage(pricesByType[type]);
    });

    neighborhood.stats = {
      propertyCount: properties.length,
      averagePriceOverall: calculateAverage(prices),
      medianPrice: calculateMedian(prices),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      averagePrice: {
        apartment: averagePrice.apartment,
        house: averagePrice.house,
        villa: averagePrice.villa,
        commercial: averagePrice.commercial,
        land: averagePrice.land,
      },
      lastUpdated: new Date().toISOString(),
    };

    return await this.neighborhoodRepository.save(neighborhood);
  }

  /**
   * Recherche de quartiers par nom (avec pagination)
   */
  async search(query: string, limit = 10): Promise<Neighborhood[]> {
    return await this.neighborhoodRepository
      .createQueryBuilder('neighborhood')
      .where('neighborhood.name ILIKE :query', { query: `%${query}%` })
      .orWhere('neighborhood.slug ILIKE :query', { query: `%${query}%` })
      .orWhere('neighborhood.city ILIKE :query', { query: `%${query}%` })
      .limit(limit)
      .orderBy('neighborhood.name', 'ASC')
      .getMany();
  }

  /**
   * Trouve le quartier le plus proche d'une position géographique
   */
  async findNearest(latitude: number, longitude: number, radiusKm = 5): Promise<Neighborhood | null> {
    const neighborhoods = await this.neighborhoodRepository
      .createQueryBuilder('neighborhood')
      .where('neighborhood.center_latitude IS NOT NULL')
      .andWhere('neighborhood.center_longitude IS NOT NULL')
      .getMany();

    if (neighborhoods.length === 0) {
      return null;
    }

    let nearest: Neighborhood | null = null;
    let minDistance = Infinity;

    neighborhoods.forEach(n => {
      if (!n.centerLatitude || !n.centerLongitude) return;

      const distance = this.calculateDistance(
        latitude,
        longitude,
        parseFloat(n.centerLatitude.toString()),
        parseFloat(n.centerLongitude.toString()),
      );

      if (distance <= radiusKm && distance < minDistance) {
        minDistance = distance;
        nearest = n;
      }
    });

    return nearest;
  }

  /**
   * Calcule la distance entre deux points (formule de Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

