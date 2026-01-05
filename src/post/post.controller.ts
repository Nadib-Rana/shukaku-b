import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Headers,
  Param,
  ParseUUIDPipe,
  UnauthorizedException,
  // ForbiddenException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(@Headers('user-id') userId: string, @Body() dto: CreatePostDto) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return await this.postService.create(userId, dto);
  }

  @Get()
  async getFeed() {
    return await this.postService.getPublicFeed();
  }

  @Get('history')
  async getHistory(@Headers('user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('User ID required');
    // ২. 'await' যুক্ত করা হয়েছে এরর দূর করতে
    return await this.postService.getMyHistory(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    // @Headers('user-id') userId?: string,
  ) {
    return await this.postService.findOne(id);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('user-id') userId: string,
  ) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return await this.postService.remove(id, userId);
  }
}
