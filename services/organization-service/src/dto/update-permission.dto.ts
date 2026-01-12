import { IsString, IsOptional, IsUUID, IsArray, MaxLength } from 'class-validator';

export class UpdatePermissionDto {
  @IsUUID()
  @IsOptional()
  resourceId?: string; // Resource entity ID

  @IsString()
  @IsOptional()
  @MaxLength(100)
  resource?: string; // Resource name (for backward compatibility)

  @IsString()
  @IsOptional()
  @MaxLength(50)
  action?: string;

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

