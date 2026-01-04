import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Subscription } from '../generated/prisma/client';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Subscription | null> {
    return this.subscriptionService.findOne(id);
  }
}
