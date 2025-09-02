import { Injectable } from '@nestjs/common';
import { BaseContentService } from '../shared/services/base-content.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ContentType } from '@prisma/client';

@Injectable()
export class DailyForecastService extends BaseContentService {
  constructor(prisma: PrismaService) {
    super(prisma, ContentType.DAILY_FORECAST);
  }

  // Специфичные методы для ежедневных прогнозов
  async generateForDate(date: string, sign?: string) {
    // Логика генерации ежедневного прогноза
    const forecast = {
      title: `Ежедневный прогноз на ${date}${sign ? ` для ${sign}` : ''}`,
      effectiveDate: date,
      status: 'DRAFT' as const,
      meta: {
        generatedAt: new Date().toISOString(),
        sign,
        date,
      },
    };

    return this.create(forecast, 'system');
  }
}






