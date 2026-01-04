import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreatePushTokenDto {
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['ios', 'android'])
  platform: string;
}
