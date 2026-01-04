import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Purchase } from '../generated/prisma/client';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  /**
   * পেমেন্ট প্রসেস করা এবং ইউজারের প্রোফাইল আপডেট করা
   */
  async create(userId: string, dto: CreatePurchaseDto): Promise<Purchase> {
    return this.prisma.$transaction(async (tx) => {
      // ১. পারচেজ রেকর্ড তৈরি
      const purchase = await tx.purchase.create({
        data: {
          userId: userId,
          subscriptionId: dto.subscriptionId,
          platform: dto.platform,
          transactionId: dto.transactionId,
          purchaseDate: new Date(),
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          status: dto.status,
        },
      });

      // ২. ইউজার টেবিলের subscriptionId আপডেট করা
      await tx.user.update({
        where: { id: userId },
        data: {
          subscriptionId: dto.subscriptionId,
        },
      });

      return purchase;
    });
  }

  /**
   * ইউজারের আগের সব কেনাকাটার ইতিহাস দেখা
   */
  async findUserPurchases(userId: string): Promise<Purchase[]> {
    return this.prisma.purchase.findMany({
      where: { userId },
      orderBy: { purchaseDate: 'desc' },
      include: { subscription: true },
    });
  }
}
