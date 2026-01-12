import { IsString, IsEmail, IsOptional, IsBoolean, MaxLength, IsUUID, IsArray } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  preferredLanguage?: string; // e.g., 'en', 'fr', 'es', 'de'

  @IsString()
  @IsOptional()
  role?: string; // Legacy role field

  @IsUUID()
  @IsOptional()
  organizationId?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  externalCode?: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  roleIds?: string[]; // RBAC role IDs
}

