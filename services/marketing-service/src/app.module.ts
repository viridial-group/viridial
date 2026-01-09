import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Campaign } from './entities/campaign.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { MarketingLead } from './entities/marketing-lead.entity';
import { EmailQueue } from './entities/email-queue.entity';
import { Workflow } from './entities/workflow.entity';
import { WorkflowStep } from './entities/workflow-step.entity';
import { Segment } from './entities/segment.entity';
import { LandingPage } from './entities/landing-page.entity';
import { Form } from './entities/form.entity';
import { FormField } from './entities/form-field.entity';
import { FormSubmission } from './entities/form-submission.entity';
import { Analytics } from './entities/analytics.entity';

import { CampaignController } from './controllers/campaign.controller';
import { EmailTemplateController } from './controllers/email-template.controller';
import { LeadController } from './controllers/lead.controller';
import { WorkflowController } from './controllers/workflow.controller';
import { SegmentController } from './controllers/segment.controller';
import { LandingPageController } from './controllers/landing-page.controller';
import { FormController } from './controllers/form.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { TrackingController } from './controllers/tracking.controller';

import { CampaignService } from './services/campaign.service';
import { EmailService } from './services/email.service';
import { EmailTemplateService } from './services/email-template.service';
import { LeadService } from './services/lead.service';
import { WorkflowService } from './services/workflow.service';
import { SegmentService } from './services/segment.service';
import { LandingPageService } from './services/landing-page.service';
import { FormService } from './services/form.service';
import { AnalyticsService } from './services/analytics.service';
import { CronService } from './services/cron.service';

// Helper pour parser DATABASE_URL
function parseDatabaseUrl(url?: string) {
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  try {
    const parsed = new URL(url);
    return {
      type: 'postgres' as const,
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 5432,
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1),
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error}`);
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => parseDatabaseUrl(process.env.DATABASE_URL),
    }),
    TypeOrmModule.forFeature([
      Campaign,
      EmailTemplate,
      MarketingLead,
      EmailQueue,
      Workflow,
      WorkflowStep,
      Segment,
      LandingPage,
      Form,
      FormField,
      FormSubmission,
      Analytics,
    ]),
  ],
  controllers: [
    CampaignController,
    EmailTemplateController,
    LeadController,
    WorkflowController,
    SegmentController,
    LandingPageController,
    FormController,
    AnalyticsController,
    TrackingController,
  ],
  providers: [
    CampaignService,
    EmailService,
    EmailTemplateService,
    LeadService,
    WorkflowService,
    SegmentService,
    LandingPageService,
    FormService,
    AnalyticsService,
    CronService,
  ],
})
export class AppModule {}

