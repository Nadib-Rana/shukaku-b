import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ContentType, PostType } from '../../generated/prisma/client';

export class CreatePostDto {
  @IsUUID()
  categoryId: string;

  @IsEnum(ContentType)
  @IsNotEmpty()
  contentType: ContentType;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  @IsString()
  voiceUrl?: string;

  @IsOptional()
  @IsBoolean()
  isResponseDefaultHidden?: boolean;

  @IsEnum(PostType)
  @IsNotEmpty()
  postType: PostType;
}
