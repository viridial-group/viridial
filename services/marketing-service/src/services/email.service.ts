import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailQueue, EmailQueueStatus } from '../entities/email-queue.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { MarketingLead } from '../entities/marketing-lead.entity';
import { Analytics, AnalyticsEventType } from '../entities/analytics.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @InjectRepository(EmailQueue)
    private emailQueueRepository: Repository<EmailQueue>,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(MarketingLead)
    private leadRepository: Repository<MarketingLead>,
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
    this.logger.log('Email transporter initialized');
  }

  /**
   * Compile un template email avec Handlebars
   */
  private compileTemplate(template: string, variables: Record<string, any>): string {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(variables);
  }

  /**
   * Ajoute un email à la queue
   */
  async queueEmail(
    leadId: string,
    emailTemplateId: string,
    campaignId: string | null,
    variables: Record<string, any> = {},
    scheduledAt?: Date,
  ): Promise<EmailQueue> {
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    // Vérifier si le lead est désabonné
    if (lead.isUnsubscribed) {
      throw new Error('Lead is unsubscribed');
    }

    const template = await this.emailTemplateRepository.findOne({
      where: { id: emailTemplateId },
    });
    if (!template) {
      throw new Error(`Email template not found: ${emailTemplateId}`);
    }

    // Compiler le template avec les variables
    const htmlContent = this.compileTemplate(template.htmlContent, {
      ...variables,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      unsubscribeUrl: this.getUnsubscribeUrl(lead.id),
    });

    const textContent = template.textContent
      ? this.compileTemplate(template.textContent, {
          ...variables,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          unsubscribeUrl: this.getUnsubscribeUrl(lead.id),
        })
      : null;

    const subject = this.compileTemplate(template.subject, {
      ...variables,
      firstName: lead.firstName,
      lastName: lead.lastName,
    });

    const trackingId = uuidv4();
    const trackingPixel = this.getTrackingPixelUrl(trackingId);

    // Injecter le pixel de tracking dans le HTML
    const htmlWithTracking = htmlContent.replace(
      '</body>',
      `<img src="${trackingPixel}" width="1" height="1" style="display:none;" /></body>`,
    );

    const emailQueue = this.emailQueueRepository.create({
      campaignId,
      leadId,
      emailTemplateId,
      to: lead.email,
      subject,
      htmlContent: htmlWithTracking,
      textContent,
      status: EmailQueueStatus.PENDING,
      scheduledAt: scheduledAt || new Date(),
      trackingId,
      organizationId: lead.organizationId,
    });

    const savedEmail = await this.emailQueueRepository.save(emailQueue);

    // Enregistrer l'événement analytics
    await this.analyticsRepository.save({
      eventType: AnalyticsEventType.EMAIL_SENT,
      campaignId,
      leadId,
      metadata: { emailQueueId: savedEmail.id, trackingId },
      organizationId: lead.organizationId,
    });

    return savedEmail;
  }

  /**
   * Envoie un email depuis la queue
   */
  async sendQueuedEmail(emailQueueId: string): Promise<void> {
    const emailQueue = await this.emailQueueRepository.findOne({
      where: { id: emailQueueId },
      relations: ['lead', 'campaign'],
    });

    if (!emailQueue) {
      throw new Error(`Email queue not found: ${emailQueueId}`);
    }

    if (emailQueue.status !== EmailQueueStatus.PENDING) {
      this.logger.warn(`Email ${emailQueueId} is not in PENDING status`);
      return;
    }

    // Vérifier si le lead est toujours abonné
    if (emailQueue.lead.isUnsubscribed) {
      emailQueue.status = EmailQueueStatus.FAILED;
      emailQueue.errorMessage = 'Lead unsubscribed';
      await this.emailQueueRepository.save(emailQueue);
      return;
    }

    try {
      emailQueue.status = EmailQueueStatus.SENDING;
      await this.emailQueueRepository.save(emailQueue);

      const mailOptions = {
        from: emailQueue.campaign?.fromEmail || this.configService.get('SMTP_FROM'),
        to: emailQueue.to,
        subject: emailQueue.subject,
        html: emailQueue.htmlContent,
        text: emailQueue.textContent,
        replyTo: emailQueue.campaign?.replyTo || undefined,
      };

      const info = await this.transporter.sendMail(mailOptions);

      emailQueue.status = EmailQueueStatus.SENT;
      emailQueue.sentAt = new Date();
      await this.emailQueueRepository.save(emailQueue);

      // Mettre à jour les statistiques du lead
      emailQueue.lead.emailOpenedCount = 0; // Reset pour le tracking
      await this.leadRepository.save(emailQueue.lead);

      this.logger.log(`Email sent successfully: ${emailQueueId} - Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email ${emailQueueId}:`, error);
      emailQueue.status = EmailQueueStatus.FAILED;
      emailQueue.errorMessage = error.message;
      emailQueue.retryCount += 1;
      await this.emailQueueRepository.save(emailQueue);

      // Marquer le lead comme bounced après 3 tentatives
      if (emailQueue.retryCount >= 3) {
        emailQueue.lead.isBounced = true;
        await this.leadRepository.save(emailQueue.lead);
      }
    }
  }

  /**
   * Traite les emails en queue (à appeler périodiquement)
   */
  async processEmailQueue(batchSize: number = 50): Promise<void> {
    const pendingEmails = await this.emailQueueRepository.find({
      where: {
        status: EmailQueueStatus.PENDING,
      },
      relations: ['lead'],
      take: batchSize,
      order: {
        scheduledAt: 'ASC',
      },
    });

    const now = new Date();
    for (const email of pendingEmails) {
      if (!email.scheduledAt || email.scheduledAt <= now) {
        await this.sendQueuedEmail(email.id);
      }
    }
  }

  /**
   * Track l'ouverture d'un email
   */
  async trackEmailOpen(trackingId: string): Promise<void> {
    const emailQueue = await this.emailQueueRepository.findOne({
      where: { trackingId },
      relations: ['lead'],
    });

    if (!emailQueue) {
      this.logger.warn(`Email queue not found for tracking ID: ${trackingId}`);
      return;
    }

    // Ne tracker qu'une seule fois
    if (!emailQueue.openedAt) {
      emailQueue.openedAt = new Date();
      emailQueue.openCount = 1;
      await this.emailQueueRepository.save(emailQueue);

      // Mettre à jour le lead
      emailQueue.lead.emailOpenedCount += 1;
      await this.leadRepository.save(emailQueue.lead);

      // Enregistrer l'événement analytics
      await this.analyticsRepository.save({
        eventType: AnalyticsEventType.EMAIL_OPENED,
        campaignId: emailQueue.campaignId,
        leadId: emailQueue.leadId,
        metadata: { emailQueueId: emailQueue.id, trackingId },
        organizationId: emailQueue.organizationId,
      });

      // Mettre à jour les stats de la campagne si applicable
      if (emailQueue.campaignId) {
        // TODO: Mettre à jour Campaign.openedCount
      }
    } else {
      emailQueue.openCount += 1;
      await this.emailQueueRepository.save(emailQueue);
    }
  }

  /**
   * Track le clic sur un lien dans un email
   */
  async trackEmailClick(trackingId: string, url: string): Promise<void> {
    const emailQueue = await this.emailQueueRepository.findOne({
      where: { trackingId },
      relations: ['lead'],
    });

    if (!emailQueue) {
      this.logger.warn(`Email queue not found for tracking ID: ${trackingId}`);
      return;
    }

    emailQueue.clickCount += 1;
    if (!emailQueue.clickedAt) {
      emailQueue.clickedAt = new Date();
    }
    await this.emailQueueRepository.save(emailQueue);

    // Mettre à jour le lead
    emailQueue.lead.emailClickedCount += 1;
    await this.leadRepository.save(emailQueue.lead);

    // Enregistrer l'événement analytics
    await this.analyticsRepository.save({
      eventType: AnalyticsEventType.EMAIL_CLICKED,
      campaignId: emailQueue.campaignId,
      leadId: emailQueue.leadId,
      metadata: { emailQueueId: emailQueue.id, trackingId, url },
      organizationId: emailQueue.organizationId,
    });
  }

  /**
   * Gère le désabonnement
   */
  async unsubscribe(leadId: string): Promise<void> {
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    lead.isUnsubscribed = true;
    lead.unsubscribedAt = new Date();
    lead.status = 'unsubscribed' as any;
    await this.leadRepository.save(lead);

    // Enregistrer l'événement analytics
    await this.analyticsRepository.save({
      eventType: AnalyticsEventType.EMAIL_UNSUBSCRIBED,
      leadId: lead.id,
      organizationId: lead.organizationId,
    });
  }

  /**
   * Génère l'URL de tracking pixel
   */
  private getTrackingPixelUrl(trackingId: string): string {
    const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    return `${baseUrl}/api/marketing/track/open/${trackingId}`;
  }

  /**
   * Génère l'URL de désabonnement
   */
  private getUnsubscribeUrl(leadId: string): string {
    const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    return `${baseUrl}/api/marketing/unsubscribe/${leadId}`;
  }
}

