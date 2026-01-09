import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Segment } from '../entities/segment.entity';
import { MarketingLead } from '../entities/marketing-lead.entity';

@Injectable()
export class SegmentService {
  constructor(
    @InjectRepository(Segment)
    private segmentRepository: Repository<Segment>,
    @InjectRepository(MarketingLead)
    private leadRepository: Repository<MarketingLead>,
  ) {}

  async create(createDto: any): Promise<Segment> {
    const segment = this.segmentRepository.create(createDto);
    return await this.segmentRepository.save(segment);
  }

  async findAll(organizationId: string): Promise<Segment[]> {
    return await this.segmentRepository.find({
      where: { organizationId },
      relations: ['leads'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Segment> {
    return await this.segmentRepository.findOne({
      where: { id, organizationId },
      relations: ['leads'],
    });
  }

  async update(id: string, organizationId: string, updateDto: any): Promise<Segment> {
    await this.segmentRepository.update({ id, organizationId }, updateDto);
    
    // Si segment dynamique, recalculer les leads
    if (updateDto.isDynamic || updateDto.filters) {
      await this.recalculateSegment(id);
    }
    
    return await this.findOne(id, organizationId);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.segmentRepository.delete({ id, organizationId });
  }

  /**
   * Recalcule les leads d'un segment dynamique
   */
  async recalculateSegment(segmentId: string): Promise<void> {
    const segment = await this.segmentRepository.findOne({
      where: { id: segmentId },
      relations: ['leads'],
    });

    if (!segment || !segment.isDynamic || !segment.filters) {
      return;
    }

    // Appliquer les filtres pour trouver les leads correspondants
    const query = this.leadRepository
      .createQueryBuilder('lead')
      .where('lead.organizationId = :organizationId', {
        organizationId: segment.organizationId,
      });

    // TODO: Appliquer les filtres dynamiquement selon segment.filters
    // Exemple: filter by status, source, customFields, etc.

    const matchingLeads = await query.getMany();

    segment.leads = matchingLeads;
    segment.leadCount = matchingLeads.length;
    await this.segmentRepository.save(segment);
  }
}

