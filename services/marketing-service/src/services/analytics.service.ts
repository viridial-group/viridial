import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Analytics, AnalyticsEventType } from '../entities/analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
  ) {}

  /**
   * Enregistre un événement analytics
   */
  async trackEvent(
    eventType: AnalyticsEventType,
    organizationId: string,
    metadata: Record<string, any> = {},
  ): Promise<Analytics> {
    const analytics = this.analyticsRepository.create({
      eventType,
      organizationId,
      metadata,
    });
    return await this.analyticsRepository.save(analytics);
  }

  /**
   * Récupère les statistiques pour une période
   */
  async getStats(organizationId: string, startDate: Date, endDate: Date) {
    const events = await this.analyticsRepository.find({
      where: {
        organizationId,
        createdAt: Between(startDate, endDate),
      },
    });

    const stats = {
      totalEvents: events.length,
      byEventType: {} as Record<AnalyticsEventType, number>,
      emailStats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
      formStats: {
        submissions: 0,
      },
      leadStats: {
        created: 0,
        updated: 0,
        converted: 0,
      },
      conversions: 0,
    };

    for (const event of events) {
      stats.byEventType[event.eventType] = (stats.byEventType[event.eventType] || 0) + 1;

      switch (event.eventType) {
        case AnalyticsEventType.EMAIL_SENT:
          stats.emailStats.sent++;
          break;
        case AnalyticsEventType.EMAIL_OPENED:
          stats.emailStats.opened++;
          break;
        case AnalyticsEventType.EMAIL_CLICKED:
          stats.emailStats.clicked++;
          break;
        case AnalyticsEventType.EMAIL_BOUNCED:
          stats.emailStats.bounced++;
          break;
        case AnalyticsEventType.EMAIL_UNSUBSCRIBED:
          stats.emailStats.unsubscribed++;
          break;
        case AnalyticsEventType.FORM_SUBMITTED:
          stats.formStats.submissions++;
          break;
        case AnalyticsEventType.LEAD_CREATED:
          stats.leadStats.created++;
          break;
        case AnalyticsEventType.LEAD_UPDATED:
          stats.leadStats.updated++;
          break;
        case AnalyticsEventType.CONVERSION:
          stats.conversions++;
          stats.leadStats.converted++;
          break;
      }
    }

    // Calculer les taux
    const emailOpenRate =
      stats.emailStats.sent > 0
        ? (stats.emailStats.opened / stats.emailStats.sent) * 100
        : 0;
    const emailClickRate =
      stats.emailStats.sent > 0
        ? (stats.emailStats.clicked / stats.emailStats.sent) * 100
        : 0;
    const conversionRate =
      stats.leadStats.created > 0
        ? (stats.conversions / stats.leadStats.created) * 100
        : 0;

    return {
      ...stats,
      rates: {
        emailOpenRate: parseFloat(emailOpenRate.toFixed(2)),
        emailClickRate: parseFloat(emailClickRate.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      },
    };
  }

  /**
   * Récupère les événements par campagne
   */
  async getCampaignStats(campaignId: string, organizationId: string) {
    const events = await this.analyticsRepository.find({
      where: {
        campaignId,
        organizationId,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      totalEvents: events.length,
      events: events.slice(0, 100), // Derniers 100 événements
    };
  }
}

