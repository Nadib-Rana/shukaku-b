import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Subscription } from '../generated/prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Subscription[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      orderBy: {
        price: 'asc',
      },
    });
    return subscriptions;
  }

  async findOne(id: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
    return subscription;
  }
}
