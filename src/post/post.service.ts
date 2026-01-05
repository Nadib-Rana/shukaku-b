import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const canHide = user.subscription?.canHideResponse || false;
    const hidePref = canHide ? (dto.isResponseDefaultHidden ?? false) : false;

    const expiryHours = user.subscription?.postExpiryHours || 24;

    return this.prisma.post.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        contentType: dto.contentType,
        textContent: dto.textContent,
        voiceUrl: dto.voiceUrl,
        isResponseDefaultHidden: hidePref,
        expiresAt: new Date(Date.now() + expiryHours * 3600000),
      },
    });
  }

  async getPublicFeed() {
    return this.prisma.post.findMany({
      where: { expiresAt: { gt: new Date() }, isDeleted: false },
      include: { category: true, _count: { select: { responses: true } } },
    });
  }

  // ৩. এই মেথডটি মিসিং ছিল (getMyHistory)
  async getMyHistory(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      include: { category: true, _count: { select: { responses: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        responses: {
          where: {
            OR: [
              { isHidden: false },
              { post: { userId: currentUserId } },
              { userId: currentUserId },
            ],
          },
        },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // ৪. এই মেথডটিও মিসিং ছিল (remove)
  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findFirst({ where: { id, userId } });
    if (!post) throw new ForbiddenException('You cannot delete this post');

    return this.prisma.post.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
