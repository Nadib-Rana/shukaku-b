import { Module } from '@nestjs/common';
import { StreakService } from './streak.service';
import { StreakController } from './streak.controller';
import { MissionModule } from '../mission/mission.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [MissionModule],
  controllers: [StreakController],
  providers: [StreakService, PrismaService],
  exports: [StreakService],
})
export class StreakModule {}
