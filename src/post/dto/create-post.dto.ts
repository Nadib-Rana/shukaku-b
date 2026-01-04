import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ContentType } from '../../generated/prisma/client';

export class CreatePostDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(ContentType)
  @IsNotEmpty()
  contentType: ContentType;

  @IsString()
  @IsOptional()
  textContent?: string;

  @IsString()
  @IsOptional()
  voiceUrl?: string;
}
