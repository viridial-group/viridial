import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common';
import { WorkflowService } from '../services/workflow.service';
import { Workflow } from '../entities/workflow.entity';

@Controller('marketing/workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  async create(@Body() createDto: any, @Request() req: any): Promise<Workflow> {
    return this.workflowService.create({
      ...createDto,
      organizationId: req.user?.organizationId || createDto.organizationId,
      createdById: req.user?.id,
    });
  }

  @Get()
  async findAll(@Request() req: any): Promise<Workflow[]> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.workflowService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<Workflow> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.workflowService.findOne(id, organizationId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Request() req: any,
  ): Promise<Workflow> {
    const organizationId = req.user?.organizationId || updateDto.organizationId;
    return this.workflowService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    return this.workflowService.remove(id, organizationId);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string, @Request() req: any): Promise<Workflow> {
    const organizationId = req.user?.organizationId || req.body.organizationId;
    return this.workflowService.activate(id, organizationId);
  }

  @Post(':id/trigger')
  async trigger(
    @Param('id') id: string,
    @Body() body: { leadId: string },
  ): Promise<{ message: string }> {
    await this.workflowService.triggerWorkflow(id, body.leadId);
    return { message: 'Workflow triggered successfully' };
  }
}

