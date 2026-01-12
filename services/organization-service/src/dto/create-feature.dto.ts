import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, MaxLength } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @MaxLength(100)
  name!: string; // e.g., 'property-management', 'user-management', 'billing'

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string; // e.g., 'core', 'premium', 'addon'

  @IsString()
  @IsOptional()
  @MaxLength(255)
  externalCode?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  permissionIds?: string[]; // Permissions to include in this feature
}

