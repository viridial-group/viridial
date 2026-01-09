import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

