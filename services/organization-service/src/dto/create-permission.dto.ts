import { IsString, IsOptional, IsUUID, IsArray, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsUUID()
  @IsOptional()
  resourceId?: string; // Resource entity ID (preferred)

  @IsString()
  @IsOptional()
  @MaxLength(100)
  resource?: string; // Resource name (for backward compatibility or if resourceId not provided)

  @IsString()
  @MaxLength(50)
  action!: string; // e.g., 'read', 'write', 'delete', 'admin'

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  externalCode?: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  featureIds?: string[]; // Features to include this permission in
}

