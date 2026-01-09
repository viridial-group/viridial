import { Controller, Get, Post, Body, Put, Param, Delete, Request, Req } from '@nestjs/common';
import { FormService } from '../services/form.service';
import { Form } from '../entities/form.entity';

@Controller('marketing/forms')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post()
  async create(@Body() createDto: any, @Request() req: any): Promise<Form> {
    return this.formService.create({
      ...createDto,
      organizationId: req.user?.organizationId || createDto.organizationId,
      createdById: req.user?.id,
    });
  }

  @Get()
  async findAll(@Request() req: any): Promise<Form[]> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.formService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<Form> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.formService.findOne(id, organizationId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Request() req: any,
  ): Promise<Form> {
    const organizationId = req.user?.organizationId || updateDto.organizationId;
    return this.formService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.formService.remove(id, organizationId);
  }

  /**
   * Endpoint public pour soumettre un formulaire
   */
  @Post(':id/submit')
  async submit(
    @Param('id') id: string,
    @Body() data: Record<string, any>,
    @Req() req: any,
  ): Promise<{ success: boolean; message: string; leadId?: string }> {
    const result = await this.formService.submitForm(id, data, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      referrer: req.get('referer'),
      organizationId: data.organizationId, // À obtenir depuis le formulaire
    });

    return {
      success: true,
      message: 'Form submitted successfully',
      leadId: result.lead?.id,
    };
  }
}

