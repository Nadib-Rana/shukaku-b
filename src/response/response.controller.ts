import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UnauthorizedException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { Response as PrismaResponse } from '../generated/prisma/client';

@Controller('responses')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  /**
   * একটি নির্দিষ্ট পোস্টে নতুন রেসপন্স (Text বা Voice) তৈরি করার জন্য।
   * হেডার থেকে user-id সংগ্রহ করা হয়।
   */
  @Post()
  async create(
    @Headers('user-id') userId: string,
    @Body() createResponseDto: CreateResponseDto,
  ): Promise<PrismaResponse> {
    if (!userId) {
      throw new UnauthorizedException('User ID is required in headers');
    }
    return this.responseService.create(userId, createResponseDto);
  }

  /**
  
   * @param postId 
   */
  @Get('post/:postId')
  async findByPost(
    @Param('postId', new ParseUUIDPipe()) postId: string,
  ): Promise<PrismaResponse[]> {
    return this.responseService.findByPost(postId);
  }
}
