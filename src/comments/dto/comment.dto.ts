// src/comments/dto/comment.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  postId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  parentId?: number;
}
