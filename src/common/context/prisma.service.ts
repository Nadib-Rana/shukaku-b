import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter: pool });
  }
  async onModuleInit() {
    await this.$connect();
    Logger.log('Connected to database : ' + process.env.DATABASE_URL);
  }
  async onModuleDestroy() {
    await this.$disconnect();
    Logger.log('Disconnected from database');
  }
}
