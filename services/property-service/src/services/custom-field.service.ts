import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { CustomFieldDefinition, CustomFieldType } from '../entities/custom-field-definition.entity';
import { CustomFieldValue } from '../entities/custom-field-value.entity';
import { CreateCustomFieldDefinitionDto } from '../dto/create-custom-field-definition.dto';
import { UpdateCustomFieldDefinitionDto } from '../dto/update-custom-field-definition.dto';
import { CustomFieldValueDto } from '../dto/custom-field-value.dto';

@Injectable()
export class CustomFieldService {
  private readonly logger = new Logger(CustomFieldService.name);

  constructor(
    @InjectRepository(CustomFieldDefinition)
    private definitionRepo: Repository<CustomFieldDefinition>,
    @InjectRepository(CustomFieldValue)
    private valueRepo: Repository<CustomFieldValue>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a custom field definition
   */
  async createDefinition(
    dto: CreateCustomFieldDefinitionDto,
    organizationId?: string,
  ): Promise<CustomFieldDefinition> {
    // Check if field_key already exists for this org + entity_type
    const existing = await this.definitionRepo.findOne({
      where: {
        organizationId: dto.organizationId || organizationId || null,
        entityType: dto.entityType,
        fieldKey: dto.fieldKey,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Field with key '${dto.fieldKey}' already exists for entity type '${dto.entityType}'`,
      );
    }

    const definition = this.definitionRepo.create({
      organizationId: dto.organizationId || organizationId || null,
      entityType: dto.entityType,
      fieldKey: dto.fieldKey,
      label: dto.label,
      fieldType: dto.fieldType,
      required: dto.required || false,
      defaultValue: dto.defaultValue || null,
      validationRules: dto.validationRules || null,
      options: dto.options || null,
      reusable: dto.reusable || false,
      reusableEntityTypes: dto.reusableEntityTypes || null,
    });

    return this.definitionRepo.save(definition);
  }

  /**
   * List custom field definitions for an entity type
   */
  async listDefinitions(
    entityType: string,
    organizationId?: string,
    includeGlobal = true,
  ): Promise<CustomFieldDefinition[]> {
    const where: any = {
      entityType,
      deletedAt: null,
    };

    if (organizationId) {
      // Include org-specific and global fields
      if (includeGlobal) {
        where.organizationId = In([organizationId, null]);
      } else {
        where.organizationId = organizationId;
      }
    } else {
      // Only global fields if no org specified
      where.organizationId = null;
    }

    return this.definitionRepo.find({
      where,
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get a custom field definition by ID
   */
  async getDefinition(id: string): Promise<CustomFieldDefinition> {
    const definition = await this.definitionRepo.findOne({
      where: { id, deletedAt: null },
    });

    if (!definition) {
      throw new NotFoundException(`Custom field definition with ID ${id} not found`);
    }

    return definition;
  }

  /**
   * Update a custom field definition
   */
  async updateDefinition(
    id: string,
    dto: UpdateCustomFieldDefinitionDto,
  ): Promise<CustomFieldDefinition> {
    const definition = await this.getDefinition(id);

    // Check if values exist - if so, restrict what can be changed
    const valueCount = await this.valueRepo.count({
      where: { fieldDefinitionId: id },
    });

    if (valueCount > 0) {
      // Cannot change fieldKey, entityType, or fieldType if values exist
      if (dto.fieldKey && dto.fieldKey !== definition.fieldKey) {
        throw new BadRequestException(
          'Cannot change fieldKey when values exist. Delete all values first.',
        );
      }
      if (dto.entityType && dto.entityType !== definition.entityType) {
        throw new BadRequestException(
          'Cannot change entityType when values exist. Delete all values first.',
        );
      }
      if (dto.fieldType && dto.fieldType !== definition.fieldType) {
        throw new BadRequestException(
          'Cannot change fieldType when values exist. Delete all values first.',
        );
      }
    }

    // Update allowed fields
    if (dto.label !== undefined) definition.label = dto.label;
    if (dto.required !== undefined) definition.required = dto.required;
    if (dto.defaultValue !== undefined) definition.defaultValue = dto.defaultValue;
    if (dto.validationRules !== undefined) definition.validationRules = dto.validationRules;
    if (dto.options !== undefined) definition.options = dto.options;
    if (dto.reusable !== undefined) definition.reusable = dto.reusable;
    if (dto.reusableEntityTypes !== undefined) definition.reusableEntityTypes = dto.reusableEntityTypes;

    return this.definitionRepo.save(definition);
  }

  /**
   * Delete (soft delete) a custom field definition
   */
  async deleteDefinition(id: string, hardDelete = false): Promise<void> {
    const definition = await this.getDefinition(id);

    const valueCount = await this.valueRepo.count({
      where: { fieldDefinitionId: id },
    });

    if (valueCount > 0 && hardDelete) {
      throw new BadRequestException(
        'Cannot hard delete definition with existing values. Use soft delete or delete values first.',
      );
    }

    if (hardDelete) {
      await this.definitionRepo.remove(definition);
    } else {
      // Soft delete
      definition.deletedAt = new Date();
      await this.definitionRepo.save(definition);
    }
  }

  /**
   * Reuse a field definition for another entity type
   */
  async reuseDefinition(
    definitionId: string,
    targetEntityType: string,
    organizationId?: string,
  ): Promise<CustomFieldDefinition> {
    const sourceDefinition = await this.getDefinition(definitionId);

    if (!sourceDefinition.reusable) {
      throw new BadRequestException('This field definition is not marked as reusable');
    }

    if (
      sourceDefinition.reusableEntityTypes &&
      !sourceDefinition.reusableEntityTypes.includes(targetEntityType)
    ) {
      throw new BadRequestException(
        `This field cannot be reused for entity type '${targetEntityType}'`,
      );
    }

    // Check if already exists for target entity type
    const existing = await this.definitionRepo.findOne({
      where: {
        organizationId: sourceDefinition.organizationId,
        entityType: targetEntityType,
        fieldKey: sourceDefinition.fieldKey,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Field '${sourceDefinition.fieldKey}' already exists for entity type '${targetEntityType}'`,
      );
    }

    // Create a copy for the new entity type
    const newDefinition = this.definitionRepo.create({
      organizationId: sourceDefinition.organizationId,
      entityType: targetEntityType,
      fieldKey: sourceDefinition.fieldKey,
      label: sourceDefinition.label,
      fieldType: sourceDefinition.fieldType,
      required: sourceDefinition.required,
      defaultValue: sourceDefinition.defaultValue,
      validationRules: sourceDefinition.validationRules,
      options: sourceDefinition.options,
      reusable: sourceDefinition.reusable,
      reusableEntityTypes: sourceDefinition.reusableEntityTypes,
    });

    return this.definitionRepo.save(newDefinition);
  }

  /**
   * Set a custom field value for an entity
   */
  async setValue(
    entityType: string,
    entityId: string,
    valueDto: CustomFieldValueDto,
    organizationId?: string,
  ): Promise<CustomFieldValue> {
    const definition = await this.getDefinition(valueDto.fieldDefinitionId);

    // Validate entity type matches
    if (definition.entityType !== entityType) {
      throw new BadRequestException(
        `Field definition is for entity type '${definition.entityType}', not '${entityType}'`,
      );
    }

    // Validate value type matches field type
    this.validateValueType(valueDto, definition);

    // Validate value against validation rules
    this.validateValue(valueDto, definition);

    // Find existing value or create new
    const existingValue = await this.valueRepo.findOne({
      where: {
        entityType,
        entityId,
        fieldDefinitionId: definition.id,
      },
    });

    const valueData: Partial<CustomFieldValue> = {
      organizationId: definition.organizationId || organizationId || null,
      entityType,
      entityId,
      fieldDefinitionId: definition.id,
      valueText: null,
      valueNumber: null,
      valueDate: null,
      valueBoolean: null,
      valueJson: null,
    };

    // Set the appropriate value column based on field type
    switch (definition.fieldType) {
      case CustomFieldType.TEXT:
      case CustomFieldType.TEXTAREA:
      case CustomFieldType.URL:
      case CustomFieldType.EMAIL:
        valueData.valueText = valueDto.valueText || null;
        break;

      case CustomFieldType.NUMBER:
        valueData.valueNumber = valueDto.valueNumber || null;
        break;

      case CustomFieldType.DATE:
      case CustomFieldType.DATETIME:
        valueData.valueDate = valueDto.valueDate ? new Date(valueDto.valueDate) : null;
        break;

      case CustomFieldType.BOOLEAN:
        valueData.valueBoolean = valueDto.valueBoolean ?? null;
        break;

      case CustomFieldType.SELECT:
        valueData.valueJson = valueDto.valueJson || null;
        break;

      case CustomFieldType.MULTISELECT:
        valueData.valueJson = Array.isArray(valueDto.valueJson) ? valueDto.valueJson : null;
        break;
    }

    if (existingValue) {
      // Update existing
      Object.assign(existingValue, valueData);
      return this.valueRepo.save(existingValue);
    } else {
      // Create new
      const value = this.valueRepo.create(valueData);
      return this.valueRepo.save(value);
    }
  }

  /**
   * Get all custom field values for an entity
   */
  async getEntityValues(
    entityType: string,
    entityId: string,
  ): Promise<CustomFieldValue[]> {
    return this.valueRepo.find({
      where: {
        entityType,
        entityId,
      },
      relations: ['fieldDefinition'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get custom field values with definitions for an entity
   */
  async getEntityValuesWithDefinitions(
    entityType: string,
    entityId: string,
  ): Promise<Array<CustomFieldValue & { definition: CustomFieldDefinition }>> {
    const values = await this.getEntityValues(entityType, entityId);
    return values.map((value) => ({
      ...value,
      definition: value.fieldDefinition,
    }));
  }

  /**
   * Delete a custom field value
   */
  async deleteValue(valueId: string): Promise<void> {
    const value = await this.valueRepo.findOne({ where: { id: valueId } });
    if (!value) {
      throw new NotFoundException(`Custom field value with ID ${valueId} not found`);
    }
    await this.valueRepo.remove(value);
  }

  /**
   * Delete all custom field values for an entity
   */
  async deleteEntityValues(entityType: string, entityId: string): Promise<void> {
    await this.valueRepo.delete({
      entityType,
      entityId,
    });
  }

  /**
   * Validate value type matches field definition type
   */
  private validateValueType(
    valueDto: CustomFieldValueDto,
    definition: CustomFieldDefinition,
  ): void {
    switch (definition.fieldType) {
      case CustomFieldType.TEXT:
      case CustomFieldType.TEXTAREA:
      case CustomFieldType.URL:
      case CustomFieldType.EMAIL:
        if (valueDto.valueText === undefined) {
          throw new BadRequestException(`Value for ${definition.fieldType} field must be a string`);
        }
        break;

      case CustomFieldType.NUMBER:
        if (valueDto.valueNumber === undefined) {
          throw new BadRequestException('Value for number field must be a number');
        }
        break;

      case CustomFieldType.DATE:
      case CustomFieldType.DATETIME:
        if (valueDto.valueDate === undefined) {
          throw new BadRequestException('Value for date field must be a date string');
        }
        break;

      case CustomFieldType.BOOLEAN:
        if (valueDto.valueBoolean === undefined) {
          throw new BadRequestException('Value for boolean field must be a boolean');
        }
        break;

      case CustomFieldType.SELECT:
        if (valueDto.valueJson === undefined) {
          throw new BadRequestException('Value for select field must be provided');
        }
        if (definition.options && !definition.options.includes(valueDto.valueJson as string)) {
          throw new BadRequestException(
            `Value '${valueDto.valueJson}' is not in the allowed options`,
          );
        }
        break;

      case CustomFieldType.MULTISELECT:
        if (valueDto.valueJson === undefined) {
          throw new BadRequestException('Value for multiselect field must be an array');
        }
        if (!Array.isArray(valueDto.valueJson)) {
          throw new BadRequestException('Value for multiselect field must be an array');
        }
        if (definition.options) {
          const invalidValues = (valueDto.valueJson as string[]).filter(
            (v) => !definition.options!.includes(v),
          );
          if (invalidValues.length > 0) {
            throw new BadRequestException(
              `Values [${invalidValues.join(', ')}] are not in the allowed options`,
            );
          }
        }
        break;
    }
  }

  /**
   * Validate value against validation rules
   */
  private validateValue(
    valueDto: CustomFieldValueDto,
    definition: CustomFieldDefinition,
  ): void {
    if (!definition.validationRules) {
      return;
    }

    const rules = definition.validationRules;

    // Required validation
    if (definition.required) {
      const hasValue =
        valueDto.valueText !== undefined ||
        valueDto.valueNumber !== undefined ||
        valueDto.valueDate !== undefined ||
        valueDto.valueBoolean !== undefined ||
        valueDto.valueJson !== undefined;

      if (!hasValue) {
        throw new BadRequestException(`Field '${definition.fieldKey}' is required`);
      }
    }

    // Min/Max for numbers
    if (definition.fieldType === CustomFieldType.NUMBER && valueDto.valueNumber !== undefined) {
      if (rules.min !== undefined && valueDto.valueNumber < rules.min) {
        throw new BadRequestException(`Value must be >= ${rules.min}`);
      }
      if (rules.max !== undefined && valueDto.valueNumber > rules.max) {
        throw new BadRequestException(`Value must be <= ${rules.max}`);
      }
    }

    // Min/Max length for text
    if (
      (definition.fieldType === CustomFieldType.TEXT ||
        definition.fieldType === CustomFieldType.TEXTAREA) &&
      valueDto.valueText !== undefined
    ) {
      if (rules.minLength !== undefined && valueDto.valueText.length < rules.minLength) {
        throw new BadRequestException(`Text length must be >= ${rules.minLength}`);
      }
      if (rules.maxLength !== undefined && valueDto.valueText.length > rules.maxLength) {
        throw new BadRequestException(`Text length must be <= ${rules.maxLength}`);
      }
    }

    // Pattern (regex) for text
    if (
      (definition.fieldType === CustomFieldType.TEXT ||
        definition.fieldType === CustomFieldType.TEXTAREA ||
        definition.fieldType === CustomFieldType.URL ||
        definition.fieldType === CustomFieldType.EMAIL) &&
      valueDto.valueText !== undefined &&
      rules.pattern
    ) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(valueDto.valueText)) {
        throw new BadRequestException(`Value does not match required pattern: ${rules.pattern}`);
      }
    }
  }
}

