import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common';
import { SegmentService } from '../services/segment.service';
import { Segment } from '../entities/segment.entity';

@Controller('marketing/segments')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @Post()
  async create(@Body() createDto: any, @Request() req: any): Promise<Segment> {
    return this.segmentService.create({
      ...createDto,
      organizationId: req.user?.organizationId || createDto.organizationId,
      createdById: req.user?.id,
    });
  }

  @Get()
  async findAll(@Request() req: any): Promise<Segment[]> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.segmentService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<Segment> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.segmentService.findOne(id, organizationId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Request() req: any,
  ): Promise<Segment> {
    const organizationId = req.user?.organizationId || updateDto.organizationId;
    return this.segmentService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.segmentService.remove(id, organizationId);
  }
}

