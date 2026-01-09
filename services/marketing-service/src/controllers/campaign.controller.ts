import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CampaignService } from '../services/campaign.service';
import { Campaign } from '../entities/campaign.entity';

// TODO: Implémenter le guard d'authentification
// import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('marketing/campaigns')
// @UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  async create(@Body() createDto: any, @Request() req: any): Promise<Campaign> {
    return this.campaignService.create({
      ...createDto,
      organizationId: req.user?.organizationId || createDto.organizationId,
      createdById: req.user?.id,
    });
  }

  @Get()
  async findAll(@Request() req: any): Promise<Campaign[]> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.campaignService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<Campaign> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.campaignService.findOne(id, organizationId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Request() req: any,
  ): Promise<Campaign> {
    const organizationId = req.user?.organizationId || updateDto.organizationId;
    return this.campaignService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.campaignService.remove(id, organizationId);
  }

  @Post(':id/schedule')
  async schedule(
    @Param('id') id: string,
    @Body() body: { scheduledAt: Date },
    @Request() req: any,
  ): Promise<Campaign> {
    const organizationId = req.user?.organizationId || body.organizationId;
    return this.campaignService.schedule(id, organizationId, new Date(body.scheduledAt));
  }

  @Post(':id/send')
  async send(@Param('id') id: string, @Request() req: any): Promise<{ message: string }> {
    const organizationId = req.user?.organizationId || req.body.organizationId;
    await this.campaignService.send(id, organizationId);
    return { message: 'Campaign sent successfully' };
  }
}

