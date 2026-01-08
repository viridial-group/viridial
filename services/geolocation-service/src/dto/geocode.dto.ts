import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class GeocodeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  address!: string;

  @IsString()
  @IsOptional()
  country?: string; // Hint for geocoding (e.g., 'FR', 'US')
}

export class ReverseGeocodeDto {
  @IsNotEmpty()
  latitude!: number;

  @IsNotEmpty()
  longitude!: number;
}

export class DistanceDto {
  @IsNotEmpty()
  lat1!: number;

  @IsNotEmpty()
  lon1!: number;

  @IsNotEmpty()
  lat2!: number;

  @IsNotEmpty()
  lon2!: number;
}

export class NearbySearchDto {
  @IsNotEmpty()
  latitude!: number;

  @IsNotEmpty()
  longitude!: number;

  @IsNotEmpty()
  radiusKm!: number; // Radius in kilometers

  @IsOptional()
  limit?: number = 20;

  @IsOptional()
  offset?: number = 0;
}

