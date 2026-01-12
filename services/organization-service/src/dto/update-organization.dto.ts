import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsUUID,
  IsUrl,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Plan, LegalForm, SubscriptionStatus, ComplianceStatus } from '../entities/organization.entity';
import { AddressType } from '../entities/organization-address.entity';
import { PhoneType } from '../entities/organization-phone.entity';
import { EmailType } from '../entities/organization-email.entity';
import { CreateAddressDto, CreatePhoneDto, CreateEmailDto } from './create-organization.dto';

// Manual UpdateOrganizationDto (all fields optional, based on CreateOrganizationDto)
export class UpdateOrganizationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(400)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must be lowercase alphanumeric with hyphens only',
  })
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  logo?: string;

  @IsEnum(['free', 'basic', 'professional', 'enterprise'])
  @IsOptional()
  plan?: Plan;

  @IsNumber()
  @Min(1)
  @Max(100000)
  @IsOptional()
  maxUsers?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string | null;

  // Legal information
  @IsString()
  @IsOptional()
  @MaxLength(400)
  legalName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  vatNumber?: string;

  @IsEnum(['SARL', 'SA', 'SAS', 'SNC', 'EURL', 'SELARL', 'SCI', 'Other'])
  @IsOptional()
  legalForm?: LegalForm;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  rcsNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  siren?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  siret?: string;

  @IsDateString()
  @IsOptional()
  foundingDate?: string;

  // Financial information
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRate?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  paymentTerms?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  billingEmail?: string;

  // Business information
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  industry?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];

  @IsNumber()
  @Min(1800)
  @Max(2100)
  @IsOptional()
  yearEstablished?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  // Social networks
  @IsObject()
  @IsOptional()
  socialNetworks?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };

  // Management information
  @IsString()
  @IsOptional()
  @MaxLength(200)
  managerName?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  managerEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  managerPhone?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(255)
  internalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  externalCode?: string;

  // Contractual information
  @IsDateString()
  @IsOptional()
  contractStartDate?: string;

  @IsDateString()
  @IsOptional()
  contractEndDate?: string;

  @IsDateString()
  @IsOptional()
  contractRenewalDate?: string;

  @IsEnum(['active', 'trial', 'suspended', 'cancelled', 'expired'])
  @IsOptional()
  subscriptionStatus?: SubscriptionStatus;

  // Compliance information
  @IsEnum(['compliant', 'pending', 'non_compliant', 'under_review'])
  @IsOptional()
  complianceStatus?: ComplianceStatus;

  @IsDateString()
  @IsOptional()
  lastComplianceCheck?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  licenseAuthority?: string;

  @IsDateString()
  @IsOptional()
  licenseExpiryDate?: string;

  // Contact information
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  @IsOptional()
  addresses?: CreateAddressDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhoneDto)
  @IsOptional()
  phones?: CreatePhoneDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmailDto)
  @IsOptional()
  emails?: CreateEmailDto[];

  @IsUUID()
  @IsOptional()
  createdBy?: string;
}

