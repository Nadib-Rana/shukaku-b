import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePushTokenDto {
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  // @IsString()
  // @IsIn(['ios', 'android'])
  // platform: string;
}
