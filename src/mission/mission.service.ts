import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMissionDto } from './dto/create-mission.dto';

@Injectable()
export class MissionService {
  constructor(private prisma: PrismaService) {}

  // Create a new misstion
  async create(createMissionDto: CreateMissionDto) {
    return this.prisma.mission.create({
      data: createMissionDto,
    });
  }

  /**
   * Track the progree of the user (Workflow 2, 3)
   */
  async trackProgress(userId: string, missionSlug: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { slug: missionSlug },
    });

    if (!mission) return;

    const progress = await this.prisma.userMissionProgress.upsert({
      where: {
        userId_missionId: { userId, missionId: mission.id },
      },
      update: {
        currentCount: { increment: 1 },
      },
      create: {
        userId,
        missionId: mission.id,
        currentCount: 1,
      },
    });

    // মিশন সম্পন্ন হলে XP রিওয়ার্ড দেওয়া (Workflow 4)
    if (
      !progress.isCompleted &&
      progress.currentCount >= mission.requirementCount
    ) {
      await this.completeMission(userId, progress.id, mission.xpReward);
    }
  }

  private async completeMission(
    userId: string,
    progressId: string,
    xpReward: number,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.userMissionProgress.update({
        where: { id: progressId },
        data: { isCompleted: true },
      });

      await tx.user.update({
        where: { id: userId },
        data: { currentXp: { increment: xpReward } },
      });
    });
  }

  // ইউজারের সব মিশনের বর্তমান অবস্থা দেখা
  async getMyMissions(userId: string) {
    return this.prisma.userMissionProgress.findMany({
      where: { userId },
      include: { mission: true },
    });
  }
}
