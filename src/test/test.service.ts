import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { PaginatedResponseDto } from 'src/common/dto/api-response.dto';
import { PrismaService } from 'src/common/context/prisma.service';

@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. CREATE
  async create(createTestDto: CreateTestDto) {
    Logger.log(createTestDto);
    return this.prisma.user.create({
      data: createTestDto,
    });
  }

  // 2. FIND ALL (Paginated - already implemented correctly)
  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ skip, take: limit }),
      this.prisma.user.count(),
    ]);
    return new PaginatedResponseDto(data, total, page, limit);
  }

  // 3. FIND ONE
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // 4. UPDATE
  async update(id: number, updateTestDto: UpdateTestDto) {
    // Check if exists first (optional, but good for explicit 404s)
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateTestDto,
    });
  }

  // 5. REMOVE
  async remove(id: number) {
    await this.findOne(id); // Ensure exists before deleting

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
