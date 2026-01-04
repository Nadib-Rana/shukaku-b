import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(@Headers('user-id') userId: string, @Body() dto: CreatePostDto) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return this.postService.create(userId, dto);
  }

  @Get()
  async getFeed() {
    return this.postService.getPublicFeed();
  }

  @Get('history')
  async getHistory(@Headers('user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return this.postService.getMyHistory(userId);
  }
}
