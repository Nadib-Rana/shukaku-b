import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
// Browser Notification API এর সাথে কনফ্লিক্ট এড়াতে টাইপ এলিয়াস ব্যবহার
import {
  Notification as PrismaNotification,
  Prisma,
} from '../generated/prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto): Promise<PrismaNotification | null> {
    // No notification for own post
    if (dto.userId === dto.triggerUserId) return null;

    return await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        triggerUserId: dto.triggerUserId,
        type: dto.type,
        postId: dto.postId,
        responseId: dto.responseId,
        parentResponseId: dto.parentResponseId,
        favoriteId: dto.favoriteId,
      },
    });
  }

  async findAll(userId: string): Promise<PrismaNotification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      include: {
        triggerUser: { select: { anonymousId: true } },
        post: { select: { contentType: true, textContent: true } },
        response: { select: { textContent: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications as PrismaNotification[];
  }

  async markAsRead(id: string, userId: string): Promise<PrismaNotification> {
    return await this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
    return await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
