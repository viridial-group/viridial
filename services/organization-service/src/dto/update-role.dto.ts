import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  @IsOptional()
  parentId?: string | null; // Parent role for hierarchy

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  permissionIds?: string[];
}

