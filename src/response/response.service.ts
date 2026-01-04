import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { Response } from '../../src/generated/prisma/client';

@Injectable()
export class ResponseService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateResponseDto): Promise<Response> {
    return this.prisma.response.create({
      data: { ...dto, userId },
    });
  }

  async findByPost(postId: string): Promise<Response[]> {
    return this.prisma.response.findMany({
      where: { postId, isHidden: false },
      orderBy: { createdAt: 'asc' },
    });
  }
}
