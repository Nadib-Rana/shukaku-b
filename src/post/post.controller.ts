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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('voiceFile'))
  async create(
    @Headers('user-id') userId: string,
    @Body() dto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return await this.postService.create(userId, dto, file);
  }

  @Get()
  async getFeed() {
    return await this.postService.getPublicFeed();
  }

  @Get('history')
  async getHistory(@Headers('user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return await this.postService.getMyHistory(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('user-id') userId?: string,
  ) {
    return await this.postService.findOne(id, userId);
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
