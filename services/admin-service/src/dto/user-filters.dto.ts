import { IsString, IsBoolean, IsUUID, IsOptional } from 'class-validator';

export class UserFiltersDto {
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}

