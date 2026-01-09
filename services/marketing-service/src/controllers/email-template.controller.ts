import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common';
import { EmailTemplateService } from '../services/email-template.service';
import { EmailTemplate } from '../entities/email-template.entity';

@Controller('marketing/email-templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  async create(@Body() createDto: any, @Request() req: any): Promise<EmailTemplate> {
    return this.emailTemplateService.create({
      ...createDto,
      organizationId: req.user?.organizationId || createDto.organizationId,
      createdById: req.user?.id,
    });
  }

  @Get()
  async findAll(@Request() req: any): Promise<EmailTemplate[]> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.emailTemplateService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<EmailTemplate> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.emailTemplateService.findOne(id, organizationId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Request() req: any,
  ): Promise<EmailTemplate> {
    const organizationId = req.user?.organizationId || updateDto.organizationId;
    return this.emailTemplateService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.emailTemplateService.remove(id, organizationId);
  }
}

