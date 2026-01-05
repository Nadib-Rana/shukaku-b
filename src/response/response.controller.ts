import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Headers,
  Param,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Controller('responses')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  // ১. পোস্টে রেসপন্স করা (অটোমেটিক হাইড লজিক এখানে কাজ করবে)
  @Post()
  async create(
    @Headers('user-id') userId: string,
    @Body() dto: CreateResponseDto,
  ) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return this.responseService.create(userId, dto);
  }

  // ২. শুধুমাত্র পাবলিক রেসপন্সগুলো দেখা (পোস্ট আইডি দিয়ে)
  @Get('post/:postId')
  async findAllByPost(@Param('postId', new ParseUUIDPipe()) postId: string) {
    return this.responseService.findAllByPost(postId);
  }

  // ৩. নিজের করা রেসপন্স ডিলিট করা
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('user-id') userId: string,
  ) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return this.responseService.remove(id, userId);
  }
}
