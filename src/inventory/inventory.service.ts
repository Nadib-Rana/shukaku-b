import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * XP খরচ করে প্রিমিয়াম ক্রেডিট কেনা (Workflow 6)
   * প্রতিটি প্রিমিয়াম পোস্ট খরচ: ২৫০ XP
   */
  async purchaseCreditWithXp(userId: string, itemType: string) {
    const COST_IN_XP = 250;

    return await this.prisma.$transaction(async (tx) => {
      // ১. ইউজারের যথেষ্ট XP আছে কিনা চেক করা
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.currentXp < COST_IN_XP) {
        throw new BadRequestException('Insufficient XP to purchase this item.');
      }

      // ২. ইউজারের XP কমানো
      await tx.user.update({
        where: { id: userId },
        data: { currentXp: { decrement: COST_IN_XP } },
      });

      // ৩. ইনভেন্টরিতে ক্রেডিট যোগ করা
      return await tx.userInventory.upsert({
        where: { userId_itemType: { userId, itemType } },
        update: { quantity: { increment: 1 } },
        create: { userId, itemType, quantity: 1 },
      });
    });
  }

  /**
   * ইনভেন্টরি থেকে আইটেম ব্যবহার করা
   */
  async consumeItem(userId: string, itemType: string) {
    const inventory = await this.prisma.userInventory.findUnique({
      where: { userId_itemType: { userId, itemType } },
    });

    if (!inventory || inventory.quantity < 1) {
      throw new BadRequestException('You do not have enough credits.');
    }

    return await this.prisma.userInventory.update({
      where: { id: inventory.id },
      data: { quantity: { decrement: 1 } },
    });
  }

  // ইউজারের বর্তমান সব ক্রেডিট দেখা
  async getMyInventory(userId: string) {
    return this.prisma.userInventory.findMany({
      where: { userId },
    });
  }
}
