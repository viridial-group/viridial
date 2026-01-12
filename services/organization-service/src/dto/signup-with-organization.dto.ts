import { IsEmail, IsString, MinLength, Matches, IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrganizationDto } from './create-organization.dto';

export class SignupWithOrganizationDto {
  // User information
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password!: string;

  @IsString()
  @MinLength(8)
  confirmPassword!: string;

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

  // Organization information
  @ValidateNested()
  @Type(() => CreateOrganizationDto)
  organization!: CreateOrganizationDto;
}

