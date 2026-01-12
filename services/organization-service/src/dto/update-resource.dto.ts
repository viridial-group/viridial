import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateResourceDto {
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
}

