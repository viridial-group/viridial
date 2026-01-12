import { IsString, IsOptional, IsUUID, IsArray, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsUUID()
  @IsOptional()
  organizationId?: string | null; // null = global role (system admin)

  @IsUUID()
  @IsOptional()
  parentId?: string | null; // Parent role for hierarchy

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  permissionIds?: string[];
}

