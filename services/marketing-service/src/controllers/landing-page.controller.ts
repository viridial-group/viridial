import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common';
import { LandingPageService } from '../services/landing-page.service';
import { LandingPage } from '../entities/landing-page.entity';

@Controller('marketing/landing-pages')
export class LandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  @Post()
  async create(@Body() createDto: any, @Request() req: any): Promise<LandingPage> {
    return this.landingPageService.create({
      ...createDto,
      organizationId: req.user?.organizationId || createDto.organizationId,
      createdById: req.user?.id,
    });
  }

  @Get()
  async findAll(@Request() req: any): Promise<LandingPage[]> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.landingPageService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<LandingPage> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.landingPageService.findOne(id, organizationId);
  }

  /**
   * Endpoint public pour récupérer une landing page par slug
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<LandingPage> {
    return this.landingPageService.findBySlug(slug);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Request() req: any,
  ): Promise<LandingPage> {
    const organizationId = req.user?.organizationId || updateDto.organizationId;
    return this.landingPageService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.landingPageService.remove(id, organizationId);
  }
}

