import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PushToken } from '../generated/prisma/client';
import { CreatePushTokenDto } from './dto/create-push-token.dto';

@Injectable()
export class PushTokenService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(
    userId: string,
    dto: CreatePushTokenDto,
  ): Promise<PushToken> {
    // একই ডিভাইসের জন্য টোকেন অলরেডি আছে কিনা চেক করা (ঐচ্ছিক কিন্তু ভালো প্র্যাকটিস)
    const existingToken = await this.prisma.pushToken.findFirst({
      where: {
        userId,
        deviceToken: dto.deviceToken,
      },
    });

    if (existingToken) {
      return existingToken;
    }

    return this.prisma.pushToken.create({
      data: {
        userId,
        deviceToken: dto.deviceToken,
        platform: dto.platform,
      },
    });
  }

  async removeToken(deviceToken: string): Promise<void> {
    await this.prisma.pushToken.deleteMany({
      where: { deviceToken },
    });
  }
}
