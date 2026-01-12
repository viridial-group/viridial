import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, MaxLength } from 'class-validator';

export class UpdateFeatureDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;

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

