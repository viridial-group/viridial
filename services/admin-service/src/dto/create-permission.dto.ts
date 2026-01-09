import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MaxLength(100)
  resource!: string; // e.g., 'property', 'user', 'organization'

  @IsString()
  @MaxLength(50)
  action!: string; // e.g., 'read', 'write', 'delete', 'admin'

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}

