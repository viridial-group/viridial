import {
  IsArray,
  ArrayMinSize,
  IsUUID,
  IsEnum,
  IsOptional,
  IsUUID as IsUUIDValidator,
} from 'class-validator';
import { Plan } from '../entities/organization.entity';

export class BulkDeleteOrganizationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  organizationIds!: string[];
}

export class BulkUpdateOrganizationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  organizationIds!: string[];

  @IsEnum(['free', 'basic', 'professional', 'enterprise'])
  @IsOptional()
  plan?: Plan;

  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  @IsOptional()
  parentId?: string | null; // null to remove parent
}

export class ChangeParentDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  organizationIds!: string[];

  @IsUUID()
  @IsOptional()
  newParentId?: string | null; // null to make root organizations
}


