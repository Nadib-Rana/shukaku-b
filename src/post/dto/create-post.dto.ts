import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ContentType } from '../../generated/prisma/client';

export class CreatePostDto {
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(ContentType)
  @IsNotEmpty()
  contentType: ContentType;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  @IsString()
  voiceUrl?: string; // ভয়েস পোস্টের জন্য URL

  @IsOptional()
  @IsBoolean()
  isResponseDefaultHidden?: boolean; // প্রিমিয়াম ইউজারের প্রেফারেন্স
}
