import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus, CampaignType } from '../entities/campaign.entity';
import { Segment } from '../entities/segment.entity';
import { MarketingLead } from '../entities/marketing-lead.entity';
import { EmailService } from './email.service';
import { Analytics, AnalyticsEventType } from '../entities/analytics.entity';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Segment)
    private segmentRepository: Repository<Segment>,
    @InjectRepository(MarketingLead)
    private leadRepository: Repository<MarketingLead>,
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    private emailService: EmailService,
  ) {}

  /**
   * Crée une nouvelle campagne
   */
  async create(createCampaignDto: any): Promise<Campaign> {
    const campaign = this.campaignRepository.create(createCampaignDto);
    return await this.campaignRepository.save(campaign);
  }

  /**
   * Récupère toutes les campagnes d'une organisation
   */
  async findAll(organizationId: string): Promise<Campaign[]> {
    return await this.campaignRepository.find({
      where: { organizationId },
      relations: ['segment', 'emailQueues'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupère une campagne par ID
   */
  async findOne(id: string, organizationId: string): Promise<Campaign> {
    return await this.campaignRepository.findOne({
      where: { id, organizationId },
      relations: ['segment', 'emailQueues'],
    });
  }

  /**
   * Met à jour une campagne
   */
  async update(id: string, organizationId: string, updateCampaignDto: any): Promise<Campaign> {
    await this.campaignRepository.update({ id, organizationId }, updateCampaignDto);
    return await this.findOne(id, organizationId);
  }

  /**
   * Supprime une campagne
   */
  async remove(id: string, organizationId: string): Promise<void> {
    await this.campaignRepository.delete({ id, organizationId });
  }

  /**
   * Planifie l'envoi d'une campagne
   */
  async schedule(id: string, organizationId: string, scheduledAt: Date): Promise<Campaign> {
    const campaign = await this.findOne(id, organizationId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = CampaignStatus.SCHEDULED;
    campaign.scheduledAt = scheduledAt;
    return await this.campaignRepository.save(campaign);
  }

  /**
   * Envoie une campagne
   */
  async send(id: string, organizationId: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      where: { id, organizationId },
      relations: ['segment', 'segment.leads'],
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === CampaignStatus.SENT) {
      throw new Error('Campaign already sent');
    }

    campaign.status = CampaignStatus.SENDING;
    await this.campaignRepository.save(campaign);

    try {
      let leads: MarketingLead[] = [];

      // Récupérer les leads selon le segment
      if (campaign.segmentId) {
        const segment = await this.segmentRepository.findOne({
          where: { id: campaign.segmentId },
          relations: ['leads'],
        });
        leads = segment?.leads || [];
      } else {
        // Tous les leads de l'organisation
        leads = await this.leadRepository.find({
          where: { organizationId, isUnsubscribed: false, isBounced: false },
        });
      }

      campaign.totalRecipients = leads.length;
      await this.campaignRepository.save(campaign);

      // Ajouter chaque lead à la queue d'envoi
      for (const lead of leads) {
        try {
          await this.emailService.queueEmail(
            lead.id,
            campaign.emailTemplateId,
            campaign.id,
            {}, // Variables du template
            campaign.scheduledAt || new Date(),
          );
          campaign.sentCount++;
        } catch (error) {
          this.logger.error(`Failed to queue email for lead ${lead.id}:`, error);
        }
      }

      campaign.status = CampaignStatus.SENT;
      campaign.sentAt = new Date();
      await this.campaignRepository.save(campaign);

      this.logger.log(`Campaign ${id} sent successfully to ${campaign.sentCount} recipients`);
    } catch (error) {
      campaign.status = CampaignStatus.PAUSED;
      await this.campaignRepository.save(campaign);
      throw error;
    }
  }

  /**
   * Met à jour les statistiques d'une campagne
   */
  async updateStats(campaignId: string): Promise<void> {
    // Cette méthode devrait être appelée périodiquement pour mettre à jour les stats
    // TODO: Implémenter la logique de calcul des statistiques depuis EmailQueue
  }
}

