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
import { LeadService } from '../services/lead.service';
import { MarketingLead } from '../entities/marketing-lead.entity';

@Controller('marketing/leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  async create(@Body() createDto: any, @Request() req: any): Promise<MarketingLead> {
    return this.leadService.create({
      ...createDto,
      organizationId: req.user?.organizationId || createDto.organizationId,
    });
  }

  @Get()
  async findAll(@Request() req: any, @Query() query: any): Promise<MarketingLead[]> {
    const organizationId = req.user?.organizationId || query.organizationId;
    return this.leadService.findAll(organizationId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<MarketingLead> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.leadService.findOne(id, organizationId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Request() req: any,
  ): Promise<MarketingLead> {
    const organizationId = req.user?.organizationId || updateDto.organizationId;
    return this.leadService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.leadService.remove(id, organizationId);
  }

  @Post(':id/segments/:segmentId')
  async addToSegment(
    @Param('id') leadId: string,
    @Param('segmentId') segmentId: string,
  ): Promise<void> {
    return this.leadService.addToSegment(leadId, segmentId);
  }

  @Delete(':id/segments/:segmentId')
  async removeFromSegment(
    @Param('id') leadId: string,
    @Param('segmentId') segmentId: string,
  ): Promise<void> {
    return this.leadService.removeFromSegment(leadId, segmentId);
  }
}

