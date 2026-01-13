import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  // Cron Job run par 1min
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredPosts() {
    const now = new Date();
    console.log('Run cron Job:', new Date().toLocaleString());
    try {
      const result = await this.prisma.post.updateMany({
        where: {
          expiresAt: { lt: now }, // currect > expired time
          isDeleted: false, // currect < expired time
        },
        data: {
          isDeleted: true, // update status
        },
      });

      if (result.count > 0) {
        this.logger.log(`Auto-expired ${result.count} posts.`);
      }
    } catch (error) {
      this.logger.error('Error while updating expired posts', error);
    }
  }

  async create(userId: string, dto: CreatePostDto, file?: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new NotFoundException('User not found');

    let finalVoiceUrl = dto.voiceUrl;
    if (file) {
      finalVoiceUrl = await this.minioService.uploadVoice(file);
    }

    const canHide = user.subscription?.canHideResponse || false;
    const hidePref = canHide ? (dto.isResponseDefaultHidden ?? false) : false;
    const expiryHours = user.subscription?.postExpiryHours || 24;

    return this.prisma.post.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        contentType: file ? 'TEXT' : dto.contentType,
        textContent: dto.textContent,
        PostType: dto.postType,
        voiceUrl: finalVoiceUrl,
        isResponseDefaultHidden: hidePref,
        expiresAt: new Date(Date.now() + expiryHours * 3600000),
      },
    });
  }

  async getPublicFeed() {
    console.log('Hit for get all post');
    return this.prisma.post.findMany({
      where: { expiresAt: { gt: new Date() }, isDeleted: false },
      include: {
        category: true,
        _count: { select: { favorites: true, responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(categoryId: string) {
    return this.prisma.post.findMany({
      where: {
        categoryId,
        isDeleted: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        category: true,
        _count: { select: { favorites: true, responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

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
        category: true,
        user: {
          select: {
            id: true,
            anonymousId: true,
          },
        },
        responses: {
          where: {
            OR: [
              { isHidden: false },
              { post: { userId: currentUserId } },
              { userId: currentUserId },
            ],
          },
          include: {
            user: { select: { id: true, anonymousId: true } },
          },
        },
        _count: {
          select: { favorites: true, responses: true },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findFirst({ where: { id, userId } });
    if (!post) throw new ForbiddenException('You cannot delete this post');

    return this.prisma.post.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
