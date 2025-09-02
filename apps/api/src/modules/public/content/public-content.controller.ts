import { Controller, Get, Query, Param, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PublicContentService } from './public-content.service';
import { ContentType } from '@prisma/client';

@ApiTags('Public Content')
@Controller('public/content')
export class PublicContentController {
  constructor(private readonly publicContentService: PublicContentService) {}

  @Get('by-date')
  @ApiOperation({ summary: 'Получить контент по дате' })
  @ApiResponse({ status: 200, description: 'Контент по дате' })
  async getContentByDate(
    @Query('type') type: ContentType,
    @Query('date') date: string,
    @Query('sign') sign?: string,
    @Query('locale') locale?: string,
    @Res() res: Response,
  ) {
    const content = await this.publicContentService.getContentByDate({
      type,
      date,
      sign,
      locale,
    });

    // Устанавливаем ETag для кэширования
    const etag = this.generateETag(content);
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=900'); // 15 минут

    return res.json(content);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Получить ленту контента' })
  @ApiResponse({ status: 200, description: 'Лента контента' })
  async getContentFeed(
    @Query('type') type: ContentType,
    @Query('limit') limit?: number,
    @Query('locale') locale?: string,
    @Res() res: Response,
  ) {
    const content = await this.publicContentService.getContentFeed({
      type,
      limit,
      locale,
    });

    const etag = this.generateETag(content);
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=900');

    return res.json(content);
  }

  @Get('ui-text')
  @ApiOperation({ summary: 'Получить UI текст' })
  @ApiResponse({ status: 200, description: 'UI текст' })
  async getUiText(
    @Query('keys') keys: string,
    @Query('locale') locale?: string,
    @Res() res: Response,
  ) {
    const keyArray = keys.split(',');
    const uiText = await this.publicContentService.getUiText(keyArray, locale);

    const etag = this.generateETag(uiText);
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 минут

    return res.json(uiText);
  }

  private generateETag(data: any): string {
    // Простой хеш для ETag
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `"${hash.toString(16)}"`;
  }
}






