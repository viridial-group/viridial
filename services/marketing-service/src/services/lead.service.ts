import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingLead, LeadStatus, LeadSource } from '../entities/marketing-lead.entity';
import { Segment } from '../entities/segment.entity';
import { Analytics, AnalyticsEventType } from '../entities/analytics.entity';
import { WorkflowService } from './workflow.service';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(MarketingLead)
    private leadRepository: Repository<MarketingLead>,
    @InjectRepository(Segment)
    private segmentRepository: Repository<Segment>,
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    private workflowService: WorkflowService,
  ) {}

  /**
   * Crée un nouveau lead
   */
  async create(createLeadDto: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    source?: LeadSource;
    organizationId: string;
    customFields?: Record<string, any>;
  }): Promise<MarketingLead> {
    // Vérifier si le lead existe déjà
    const existing = await this.leadRepository.findOne({
      where: { email: createLeadDto.email, organizationId: createLeadDto.organizationId },
    });

    if (existing) {
      // Mettre à jour le lead existant
      Object.assign(existing, createLeadDto);
      return await this.leadRepository.save(existing);
    }

    const lead = this.leadRepository.create({
      ...createLeadDto,
      status: LeadStatus.NEW,
      source: createLeadDto.source || LeadSource.WEBSITE,
      score: this.calculateLeadScore(createLeadDto),
    });

    const savedLead = await this.leadRepository.save(lead);

    // Enregistrer l'événement analytics
    await this.analyticsRepository.save({
      eventType: AnalyticsEventType.LEAD_CREATED,
      leadId: savedLead.id,
      organizationId: savedLead.organizationId,
      metadata: { source: savedLead.source },
    });

    // Déclencher les workflows pour lead_created
    await this.triggerWorkflowsForLead(savedLead.id, 'lead_created');

    return savedLead;
  }

  /**
   * Récupère tous les leads d'une organisation
   */
  async findAll(organizationId: string, filters?: any): Promise<MarketingLead[]> {
    const query = this.leadRepository
      .createQueryBuilder('lead')
      .where('lead.organizationId = :organizationId', { organizationId });

    if (filters?.status) {
      query.andWhere('lead.status = :status', { status: filters.status });
    }

    if (filters?.source) {
      query.andWhere('lead.source = :source', { source: filters.source });
    }

    if (filters?.segmentId) {
      query
        .innerJoin('lead.segments', 'segment')
        .andWhere('segment.id = :segmentId', { segmentId: filters.segmentId });
    }

    return await query
      .orderBy('lead.createdAt', 'DESC')
      .take(filters?.limit || 100)
      .skip(filters?.skip || 0)
      .getMany();
  }

  /**
   * Récupère un lead par ID
   */
  async findOne(id: string, organizationId: string): Promise<MarketingLead> {
    return await this.leadRepository.findOne({
      where: { id, organizationId },
      relations: ['segments'],
    });
  }

  /**
   * Met à jour un lead
   */
  async update(
    id: string,
    organizationId: string,
    updateLeadDto: Partial<MarketingLead>,
  ): Promise<MarketingLead> {
    const lead = await this.findOne(id, organizationId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    Object.assign(lead, updateLeadDto);

    // Recalculer le score si nécessaire
    if (updateLeadDto.email || updateLeadDto.customFields) {
      lead.score = this.calculateLeadScore(lead);
    }

    const savedLead = await this.leadRepository.save(lead);

    // Enregistrer l'événement analytics
    await this.analyticsRepository.save({
      eventType: AnalyticsEventType.LEAD_UPDATED,
      leadId: savedLead.id,
      organizationId: savedLead.organizationId,
    });

    // Déclencher les workflows pour lead_updated
    await this.triggerWorkflowsForLead(savedLead.id, 'lead_updated');

    return savedLead;
  }

  /**
   * Supprime un lead
   */
  async remove(id: string, organizationId: string): Promise<void> {
    await this.leadRepository.delete({ id, organizationId });
  }

  /**
   * Ajoute un lead à un segment
   */
  async addToSegment(leadId: string, segmentId: string): Promise<void> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['segments'],
    });

    const segment = await this.segmentRepository.findOne({
      where: { id: segmentId },
      relations: ['leads'],
    });

    if (!lead || !segment) {
      throw new Error('Lead or segment not found');
    }

    if (!lead.segments.some((s) => s.id === segmentId)) {
      lead.segments.push(segment);
      await this.leadRepository.save(lead);
    }
  }

  /**
   * Retire un lead d'un segment
   */
  async removeFromSegment(leadId: string, segmentId: string): Promise<void> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['segments'],
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    lead.segments = lead.segments.filter((s) => s.id !== segmentId);
    await this.leadRepository.save(lead);
  }

  /**
   * Calcule le score d'un lead
   */
  private calculateLeadScore(lead: Partial<MarketingLead>): number {
    let score = 0;

    // Points pour les informations complètes
    if (lead.firstName) score += 10;
    if (lead.lastName) score += 10;
    if (lead.phone) score += 10;
    if (lead.email && lead.email.includes('@')) score += 20;

    // Points selon la source
    switch (lead.source) {
      case LeadSource.FORM:
        score += 30;
        break;
      case LeadSource.LANDING_PAGE:
        score += 25;
        break;
      case LeadSource.REFERRAL:
        score += 35;
        break;
    }

    return score;
  }

  /**
   * Déclenche les workflows pour un lead
   */
  private async triggerWorkflowsForLead(leadId: string, trigger: string): Promise<void> {
    // Récupérer tous les workflows actifs avec ce trigger
    // TODO: Implémenter avec WorkflowService
  }
}

