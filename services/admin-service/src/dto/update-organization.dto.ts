import { IsString, IsEmail, IsOptional, IsInt, Min, IsBoolean, MaxLength } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressStreet?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  addressCity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  addressPostalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  addressCountry?: string;

  @IsString()
  @IsOptional()
  subscriptionPlan?: string;

  @IsString()
  @IsOptional()
  subscriptionStatus?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxUsers?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxProperties?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

