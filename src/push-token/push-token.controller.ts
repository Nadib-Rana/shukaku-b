import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Delete,
  Param,
} from '@nestjs/common';
import { PushTokenService } from './push-token.service';
import { CreatePushTokenDto } from './dto/create-push-token.dto';
import { PushToken } from '../generated/prisma/client';

@Controller('push-tokens')
export class PushTokenController {
  constructor(private readonly pushTokenService: PushTokenService) {}

  @Post()
  async registerToken(
    @Headers('user-id') userId: string,
    @Body() dto: CreatePushTokenDto,
  ): Promise<PushToken> {
    if (!userId) {
      throw new UnauthorizedException('User ID required');
    }
    return this.pushTokenService.createOrUpdate(userId, dto);
  }

  @Delete(':token')
  async unregisterToken(
    @Param('token') token: string,
  ): Promise<{ message: string }> {
    await this.pushTokenService.removeToken(token);
    return { message: 'Token removed successfully' };
  }
}
