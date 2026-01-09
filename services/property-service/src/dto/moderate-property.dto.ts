import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';

export enum ModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  TAKEDOWN = 'takedown',
}

export class ModeratePropertyDto {
  @IsEnum(ModerationAction)
  action!: ModerationAction;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reason?: string;
}

