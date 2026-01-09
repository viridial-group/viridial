import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  resource?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  action?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}

