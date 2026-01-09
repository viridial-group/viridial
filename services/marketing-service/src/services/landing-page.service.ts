import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingPage } from '../entities/landing-page.entity';
import { Analytics, AnalyticsEventType } from '../entities/analytics.entity';

@Injectable()
export class LandingPageService {
  constructor(
    @InjectRepository(LandingPage)
    private landingPageRepository: Repository<LandingPage>,
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
  ) {}

  async create(createDto: any): Promise<LandingPage> {
    const landingPage = this.landingPageRepository.create(createDto);
    return await this.landingPageRepository.save(landingPage) as unknown as LandingPage;
  }

  async findAll(organizationId: string): Promise<LandingPage[]> {
    return await this.landingPageRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<LandingPage> {
    return await this.landingPageRepository.findOne({
      where: { id, organizationId },
    });
  }

  async findBySlug(slug: string): Promise<LandingPage> {
    return await this.landingPageRepository.findOne({
      where: { slug, status: 'published' as any },
    });
  }

  async update(id: string, organizationId: string, updateDto: any): Promise<LandingPage> {
    await this.landingPageRepository.update({ id, organizationId }, updateDto);
    return await this.findOne(id, organizationId);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.landingPageRepository.delete({ id, organizationId });
  }

  /**
   * Track une vue de landing page
   */
  async trackView(landingPageId: string, metadata: any): Promise<void> {
    const landingPage = await this.landingPageRepository.findOne({
      where: { id: landingPageId },
    });

    if (landingPage) {
      landingPage.viewCount += 1;
      landingPage.conversionRate =
        landingPage.viewCount > 0
          ? (landingPage.conversionCount / landingPage.viewCount) * 100
          : 0;
      await this.landingPageRepository.save(landingPage);

      await this.analyticsRepository.save({
        eventType: AnalyticsEventType.PAGE_VIEW,
        landingPageId,
        organizationId: landingPage.organizationId,
        metadata,
      });
    }
  }
}

