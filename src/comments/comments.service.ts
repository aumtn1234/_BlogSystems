// src/comments/comments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';

interface CreateCommentData {
  content: string;
  postId: number;
  authorId: number;
  parentId?: number;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findByPost(postId: number) {
    return this.commentsRepository.find({
      where: { post: { id: postId } },
      relations: ['author', 'parent'],
      order: { created_at: 'DESC' },
    });
  }

  async create(data: CreateCommentData) {
    // Verify post exists
    const post = await this.postsRepository.findOne({
      where: { id: data.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentsRepository.create({
      content: data.content,
      post: { id: data.postId },
      author: { id: data.authorId },
      parent: data.parentId ? { id: data.parentId } : undefined,
    });

    return await this.commentsRepository.save(comment);
  }

  async remove(id: number, userId: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.delete(id);
    return { message: 'Comment deleted successfully' };
  }
}
