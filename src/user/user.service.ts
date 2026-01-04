import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async auth(anonymousId: string) {
    return this.prisma.user.upsert({
      where: { anonymousId },
      update: { lastActiveAt: new Date() },
      create: { anonymousId },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });
  }
}
