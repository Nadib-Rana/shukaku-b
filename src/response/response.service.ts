import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { Response } from '../generated/prisma/client';

@Injectable()
export class ResponseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateResponseDto): Promise<Response> {
    // ১. কাস্টিং ছাড়াই রেজাল্ট নিন
    const post = await this.prisma.post.findUnique({
      where: { id: dto.postId },
    });

    // ২. টাইপ গার্ড: চেক করুন পোস্ট আছে কি না
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // ৩. Unsafe assignment সমাধান: সরাসরি ভ্যালু ব্যবহার না করে টাইপ নিশ্চিত করুন
    const finalIsHidden: boolean = post.isResponseDefaultHidden === true;

    return this.prisma.response.create({
      data: {
        postId: dto.postId,
        userId: userId,
        contentType: dto.contentType,
        textContent: dto.textContent,
        voiceUrl: dto.voiceUrl,
        isHidden: finalIsHidden,
      },
    });
  }

  async findAllByPost(postId: string): Promise<Response[]> {
    return this.prisma.response.findMany({
      where: {
        postId: postId,
        isHidden: false,
      },
      include: {
        user: {
          select: { anonymousId: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(id: string, userId: string): Promise<Response> {
    // ১. কাস্টিং ছাড়া রেজাল্ট নিন
    const response = await this.prisma.response.findFirst({
      where: { id, userId },
    });

    // ২. টাইপ গার্ড
    if (!response) {
      throw new ForbiddenException(
        'You are not allowed to delete this response',
      );
    }

    return this.prisma.response.delete({
      where: { id },
    });
  }
}
