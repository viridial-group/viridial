import { IsString, IsEmail, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  slug?: string;

  @IsEmail()
  contactEmail!: string;

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

  @IsInt()
  @Min(1)
  @IsOptional()
  maxUsers?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxProperties?: number;
}

