// src/posts/posts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, category?: string) {
    const skip = (page - 1) * limit;

    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'categories')
      .where('post.status = :status', { status: 'published' })
      .orderBy('post.published_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (category) {
      query.andWhere('categories.slug = :category', { category });
    }

    const [posts, total] = await query.getManyAndCount();

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.postsRepository.findOne({
      where: { slug },
      relations: ['author', 'categories', 'comments', 'comments.author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment views
    post.views += 1;
    await this.postsRepository.save(post);

    return post;
  }

  async create(createPostDto: CreatePostDto) {
    const post = this.postsRepository.create(createPostDto);
    return await this.postsRepository.save(post);
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    await this.postsRepository.update(id, updatePostDto);
    return this.postsRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const result = await this.postsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Post not found');
    }
    return { message: 'Post deleted successfully' };
  }
}
