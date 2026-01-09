import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class FlagPropertyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

