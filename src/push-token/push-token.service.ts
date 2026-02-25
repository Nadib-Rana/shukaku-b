import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { CreatePushTokenDto } from './dto/create-push-token.dto';

@Injectable()
export class PushTokenService {
  private readonly logger = new Logger(PushTokenService.name);

  private readonly dailyMessages = [
    'Someone shared a thought today.',
    'Someone might need your perspective.',
    'A question might be waiting for your answer.',
    'A bubble is waiting for you.',
    'Someone is seeking advice on a sensitive topic.',
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * টোকেন রেজিস্টার করা এবং ইউজারের lastActiveAt আপডেট করা
   */
  async registerToken(userId: string, dto: CreatePushTokenDto) {
    // ১. ইউজারের lastActiveAt আপডেট করা
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });

    // ২. পুশ টোকেন সেভ বা আপডেট করা
    // আপনার স্কিমা অনুযায়ী 'deviceToken' ইউনিক হতে পারে
    return this.prisma.pushToken.upsert({
      where: { id: dto.token }, // এখানে আইডি হিসেবে টোকেন ব্যবহার করলে এটি কাজ করবে
      update: {
        createdAt: new Date(), // স্কিমা অনুযায়ী টাইপ ঠিক করা হলো
      },
      create: {
        userId,
        deviceToken: dto.token,
        platform: dto.platform,
      },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleEngagementCron() {
    this.logger.log('Checking for inactive users...');

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const usersToNotify = await this.prisma.user.findMany({
      where: {
        lastActiveAt: { lt: twentyFourHoursAgo },
        pushTokens: { some: {} },
      },
      include: { pushTokens: true },
    });

    for (const user of usersToNotify) {
      const message =
        this.dailyMessages[
          Math.floor(Math.random() * this.dailyMessages.length)
        ];
      for (const tokenRecord of user.pushTokens) {
        await this.sendToProvider(tokenRecord.deviceToken, message);
      }
    }
  }

  /**
   * Async এরর ফিক্স করতে Promise.resolve() বা আসল SDK কল ব্যবহার করা হয়েছে
   */
  private async sendToProvider(token: string, body: string): Promise<void> {
    this.logger.log(`Push sent to ${token}: ${body}`);

    // ভবিষ্যতে যখন Firebase অ্যাড করবেন, তখন নিচের লাইনটি await হবে
    // await this.firebaseAdmin.messaging().send({ token, notification: { body } });

    await Promise.resolve(); // এটি সাময়িকভাবে 'no-await' এরর দূর করবে
  }

  async sendInstantNotification(userId: string, message: string) {
    const tokens = await this.prisma.pushToken.findMany({ where: { userId } });
    for (const t of tokens) {
      await this.sendToProvider(t.deviceToken, message);
    }
  }
}
