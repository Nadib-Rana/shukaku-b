import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    // ইউজারের সাবস্ক্রিপশন ডাটা চেক করা
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // লজিক: সাবস্ক্রিপশন থাকলে postExpiryHours (যেমন ৪৮), না থাকলে ডিফল্ট ২৪ ঘণ্টা
    const expiryHours = user.subscription?.postExpiryHours || 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    return this.prisma.post.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        contentType: dto.contentType,
        textContent: dto.textContent,
        voiceUrl: dto.voiceUrl,
        expiresAt,
      },
      include: { category: true },
    });
  }

  // পাবলিক ফিড: অন্য ইউজারদের জন্য যারা এক্সপায়ার হয়নি
  async getPublicFeed() {
    return this.prisma.post.findMany({
      where: {
        expiresAt: { gt: new Date() }, // বর্তমান সময়ের বেশি হতে হবে
        isDeleted: false,
      },
      include: {
        category: true,
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // পার্সোনাল হিস্টোরি: নিজের সব পোস্ট (এক্সপায়ার হলেও দেখা যাবে)
  async getMyHistory(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
