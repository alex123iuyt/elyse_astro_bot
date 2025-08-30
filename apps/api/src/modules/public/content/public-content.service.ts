import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ContentType, PublishStatus } from '@prisma/client';

@Injectable()
export class PublicContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getContentByDate(params: {
    type: ContentType;
    date: string;
    sign?: string;
    locale?: string;
  }) {
    const { type, date, sign, locale = 'ru' } = params;

    const where: any = {
      type,
      status: PublishStatus.PUBLISHED,
      locale,
      OR: [
        { effectiveDate: date },
        { dateFrom: { lte: date }, dateTo: { gte: date } },
      ],
    };

    if (sign) {
      where.sign = sign;
    }

    return this.prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        body: true,
        sign: true,
        effectiveDate: true,
        dateFrom: true,
        dateTo: true,
        meta: true,
        version: true,
        updatedAt: true,
      },
    });
  }

  async getContentFeed(params: {
    type: ContentType;
    limit?: number;
    locale?: string;
  }) {
    const { type, limit = 20, locale = 'ru' } = params;

    return this.prisma.content.findMany({
      where: {
        type,
        status: PublishStatus.PUBLISHED,
        locale,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        summary: true,
        body: true,
        sign: true,
        effectiveDate: true,
        meta: true,
        version: true,
        updatedAt: true,
      },
    });
  }

  async getUiText(keys: string[], locale: string = 'ru') {
    const uiTexts = await this.prisma.content.findMany({
      where: {
        type: ContentType.UI_TEXT,
        status: PublishStatus.PUBLISHED,
        locale,
        slug: { in: keys },
      },
      select: {
        slug: true,
        body: true,
        meta: true,
      },
    });

    // Преобразуем в объект ключ-значение
    const result: Record<string, any> = {};
    for (const text of uiTexts) {
      if (text.slug) {
        result[text.slug] = text.body;
      }
    }

    return result;
  }
}



