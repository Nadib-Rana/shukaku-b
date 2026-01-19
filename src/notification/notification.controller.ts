import {
  Controller,
  Get,
  Patch,
  Param,
  Headers,
  UnauthorizedException,
  Post,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Notification as PrismaNotification } from '../generated/prisma/client';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ResponseMessage('Notifications retrieved successfully')
  async getMyNotifications(
    @Headers('user-id') userId: string | undefined,
  ): Promise<PrismaNotification[]> {
    // টাইপ-সেফ রিটার্ন
    if (!userId) throw new UnauthorizedException('User ID required');
    return await this.notificationService.findAll(userId);
  }

  @Patch(':id/read')
  @ResponseMessage('Notification marked as read')
  async readOne(
    @Param('id') id: string,
    @Headers('user-id') userId: string | undefined,
  ): Promise<PrismaNotification> {
    if (!userId) throw new UnauthorizedException('User ID required');
    return await this.notificationService.markAsRead(id, userId);
  }

  @Post('read-all')
  @ResponseMessage('All notifications marked as read')
  async readAll(@Headers('user-id') userId: string | undefined) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return await this.notificationService.markAllAsRead(userId);
  }
}
