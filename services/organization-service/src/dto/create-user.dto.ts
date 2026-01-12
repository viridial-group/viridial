import { IsString, IsEmail, IsOptional, IsUUID, MinLength, MaxLength, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

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
  role?: string; // Legacy role field (for backward compatibility)

  @IsUUID()
  @IsOptional()
  organizationId?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  externalCode?: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  roleIds?: string[]; // RBAC role IDs
}

