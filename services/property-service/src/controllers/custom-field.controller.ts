import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomFieldService } from '../services/custom-field.service';
import { CreateCustomFieldDefinitionDto } from '../dto/create-custom-field-definition.dto';
import { UpdateCustomFieldDefinitionDto } from '../dto/update-custom-field-definition.dto';
import { CustomFieldValueDto, BulkCustomFieldValuesDto } from '../dto/custom-field-value.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Custom Fields Controller
 * Manages custom field definitions and values (US-026)
 */
@Controller('custom-fields')
@UseGuards(JwtAuthGuard)
export class CustomFieldController {
  constructor(private readonly customFieldService: CustomFieldService) {}

  /**
   * Create a custom field definition
   * POST /custom-fields/definitions
   */
  @Post('definitions')
  @HttpCode(HttpStatus.CREATED)
  async createDefinition(
    @Body() dto: CreateCustomFieldDefinitionDto,
    @User() user: AuthenticatedUser,
  ) {
    return this.customFieldService.createDefinition(dto, user.organizationId);
  }

  /**
   * List custom field definitions for an entity type
   * GET /custom-fields/definitions?entity_type=property
   */
  @Get('definitions')
  async listDefinitions(
    @Query('entity_type') entityType: string,
    @Query('include_global') includeGlobal?: string,
    @User() user: AuthenticatedUser,
  ) {
    if (!entityType) {
      throw new Error('entity_type query parameter is required');
    }
    return this.customFieldService.listDefinitions(
      entityType,
      user.organizationId,
      includeGlobal !== 'false',
    );
  }

  /**
   * Get a custom field definition by ID
   * GET /custom-fields/definitions/:id
   */
  @Get('definitions/:id')
  async getDefinition(@Param('id') id: string) {
    return this.customFieldService.getDefinition(id);
  }

  /**
   * Update a custom field definition
   * PUT /custom-fields/definitions/:id
   */
  @Put('definitions/:id')
  async updateDefinition(
    @Param('id') id: string,
    @Body() dto: UpdateCustomFieldDefinitionDto,
  ) {
    return this.customFieldService.updateDefinition(id, dto);
  }

  /**
   * Delete a custom field definition (soft delete by default)
   * DELETE /custom-fields/definitions/:id?hard=true
   */
  @Delete('definitions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDefinition(
    @Param('id') id: string,
    @Query('hard') hard?: string,
  ) {
    await this.customFieldService.deleteDefinition(id, hard === 'true');
  }

  /**
   * Reuse a field definition for another entity type
   * POST /custom-fields/definitions/:id/reuse
   */
  @Post('definitions/:id/reuse')
  @HttpCode(HttpStatus.CREATED)
  async reuseDefinition(
    @Param('id') id: string,
    @Body() body: { target_entity_type: string },
    @User() user: AuthenticatedUser,
  ) {
    return this.customFieldService.reuseDefinition(
      id,
      body.target_entity_type,
      user.organizationId,
    );
  }

  /**
   * Set a custom field value for an entity
   * POST /custom-fields/values
   */
  @Post('values')
  @HttpCode(HttpStatus.CREATED)
  async setValue(
    @Body() body: { entity_type: string; entity_id: string; value: CustomFieldValueDto },
    @User() user: AuthenticatedUser,
  ) {
    return this.customFieldService.setValue(
      body.entity_type,
      body.entity_id,
      body.value,
      user.organizationId,
    );
  }

  /**
   * Get all custom field values for an entity
   * GET /custom-fields/values?entity_type=property&entity_id={id}
   */
  @Get('values')
  async getValues(
    @Query('entity_type') entityType: string,
    @Query('entity_id') entityId: string,
  ) {
    if (!entityType || !entityId) {
      throw new Error('entity_type and entity_id query parameters are required');
    }
    return this.customFieldService.getEntityValuesWithDefinitions(entityType, entityId);
  }

  /**
   * Delete a custom field value
   * DELETE /custom-fields/values/:id
   */
  @Delete('values/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteValue(@Param('id') id: string) {
    await this.customFieldService.deleteValue(id);
  }
}

