import { Controller, Get, Query, Request } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('marketing/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  async getStats(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut
    const end = endDate ? new Date(endDate) : new Date();

    return this.analyticsService.getStats(organizationId, start, end);
  }

  @Get('campaigns/:campaignId/stats')
  async getCampaignStats(
    @Param('campaignId') campaignId: string,
    @Request() req: any,
  ) {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.analyticsService.getCampaignStats(campaignId, organizationId);
  }
}

