import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpsertContentDto } from '../dto/upsert-content.dto';
import { ContentQueryDto } from '../dto/content-query.dto';
import { ContentResponseDto } from '../dto/content-response.dto';
import { ContentType, PublishStatus } from '@prisma/client';

@Injectable()
export abstract class BaseContentService {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly contentType: ContentType,
  ) {}

  async findAll(query: ContentQueryDto): Promise<{ data: ContentResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    // Построение фильтров
    const where: any = {
      type: this.contentType,
    };

    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { summary: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.sign) {
      where.sign = filters.sign;
    }

    if (filters.dateFrom) {
      where.OR = [
        { effectiveDate: { gte: filters.dateFrom } },
        { dateFrom: { gte: filters.dateFrom } },
      ];
    }

    if (filters.dateTo) {
      where.OR = [
        { effectiveDate: { lte: filters.dateTo } },
        { dateTo: { lte: filters.dateTo } },
      ];
    }

    if (filters.locale) {
      where.locale = filters.locale;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    const [data, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      data: data.map(this.mapToResponse),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ContentResponseDto | null> {
    const content = await this.prisma.content.findFirst({
      where: { id, type: this.contentType },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return content ? this.mapToResponse(content) : null;
  }

  async create(dto: UpsertContentDto, authorId: string): Promise<ContentResponseDto> {
    const content = await this.prisma.content.create({
      data: {
        ...dto,
        type: this.contentType,
        authorId,
        version: 1,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToResponse(content);
  }

  async update(id: string, dto: UpsertContentDto, authorId: string): Promise<ContentResponseDto> {
    const existing = await this.prisma.content.findFirst({
      where: { id, type: this.contentType },
    });

    if (!existing) {
      throw new Error('Content not found');
    }

    const content = await this.prisma.content.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToResponse(content);
  }

  async delete(id: string): Promise<void> {
    // Soft delete - меняем статус на ARCHIVED
    await this.prisma.content.update({
      where: { id, type: this.contentType },
      data: { status: PublishStatus.ARCHIVED },
    });
  }

  async publish(id: string): Promise<ContentResponseDto> {
    const content = await this.prisma.content.update({
      where: { id, type: this.contentType },
      data: { status: PublishStatus.PUBLISHED },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToResponse(content);
  }

  protected mapToResponse(content: any): ContentResponseDto {
    return {
      id: content.id,
      type: content.type,
      title: content.title,
      slug: content.slug,
      body: content.body,
      summary: content.summary,
      tags: content.tags,
      status: content.status,
      visibility: content.visibility,
      locale: content.locale,
      sign: content.sign,
      dateFrom: content.dateFrom?.toISOString(),
      dateTo: content.dateTo?.toISOString(),
      effectiveDate: content.effectiveDate?.toISOString(),
      authorId: content.authorId,
      authorName: content.author?.name,
      version: content.version,
      createdAt: content.createdAt.toISOString(),
      updatedAt: content.updatedAt.toISOString(),
      meta: content.meta,
    };
  }
}



