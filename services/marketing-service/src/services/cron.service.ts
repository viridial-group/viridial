import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { WorkflowService } from './workflow.service';
import { CampaignService } from './campaign.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private emailService: EmailService,
    private workflowService: WorkflowService,
    private campaignService: CampaignService,
  ) {}

  /**
   * Traite la queue d'emails toutes les minutes
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleEmailQueue() {
    this.logger.debug('Processing email queue...');
    try {
      await this.emailService.processEmailQueue(50);
    } catch (error) {
      this.logger.error('Error processing email queue:', error);
    }
  }

  /**
   * Traite les workflows toutes les 5 minutes
   */
  @Cron('*/5 * * * *')
  async handleWorkflows() {
    this.logger.debug('Processing workflows...');
    try {
      await this.workflowService.processWorkflows();
    } catch (error) {
      this.logger.error('Error processing workflows:', error);
    }
  }

  /**
   * Met à jour les statistiques des campagnes toutes les heures
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleCampaignStats() {
    this.logger.debug('Updating campaign statistics...');
    // TODO: Implémenter la mise à jour des stats
  }
}

