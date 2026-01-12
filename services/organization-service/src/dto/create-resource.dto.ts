import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @MaxLength(100)
  name!: string; // e.g., 'property', 'user', 'organization'

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string; // e.g., 'core', 'admin', 'billing'

  @IsString()
  @IsOptional()
  @MaxLength(255)
  externalCode?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

