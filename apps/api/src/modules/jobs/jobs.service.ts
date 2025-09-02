import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { GeneratorService } from '../generator/generator.service';
import { ContentType, ZodiacSign } from '@prisma/client';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generatorService: GeneratorService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async generateDailyContent() {
    this.logger.log('Starting daily content generation...');
    
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const zodiacSigns = [
        ZodiacSign.ARIES, ZodiacSign.TAURUS, ZodiacSign.GEMINI, ZodiacSign.CANCER,
        ZodiacSign.LEO, ZodiacSign.VIRGO, ZodiacSign.LIBRA, ZodiacSign.SCORPIO,
        ZodiacSign.SAGITTARIUS, ZodiacSign.CAPRICORN, ZodiacSign.AQUARIUS, ZodiacSign.PISCES,
      ];

      let generated = 0;
      for (const sign of zodiacSigns) {
        try {
          // Проверяем, есть ли уже контент на сегодня для этого знака
          const existing = await this.prisma.content.findFirst({
            where: {
              type: ContentType.DAILY_FORECAST,
              effectiveDate: todayStr,
              sign,
            },
          });

          if (!existing) {
            const forecast = await this.generatorService.generateDailyForecast({
              date: todayStr,
              sign,
              locale: 'ru',
            });

            await this.prisma.content.create({
              data: {
                ...forecast,
                authorId: 'system', // Системный пользователь
                version: 1,
              },
            });
            generated++;
          }
        } catch (error) {
          this.logger.error(`Error generating forecast for ${sign}:`, error);
        }
      }

      this.logger.log(`Daily content generation completed. Generated: ${generated}`);
    } catch (error) {
      this.logger.error('Error in daily content generation:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async generateWeeklyContent() {
    this.logger.log('Starting weekly content generation...');
    
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Начало недели (воскресенье)
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const zodiacSigns = [
        ZodiacSign.ARIES, ZodiacSign.TAURUS, ZodiacSign.GEMINI, ZodiacSign.CANCER,
        ZodiacSign.LEO, ZodiacSign.VIRGO, ZodiacSign.LIBRA, ZodiacSign.SCORPIO,
        ZodiacSign.SAGITTARIUS, ZodiacSign.CAPRICORN, ZodiacSign.AQUARIUS, ZodiacSign.PISCES,
      ];

      let generated = 0;
      for (const sign of zodiacSigns) {
        try {
          // Проверяем, есть ли уже недельный прогноз для этого знака
          const existing = await this.prisma.content.findFirst({
            where: {
              type: ContentType.WEEKLY_FORECAST,
              dateFrom: weekStartStr,
              sign,
            },
          });

          if (!existing) {
            const forecast = await this.generatorService.generateWeeklyForecast({
              weekStart: weekStartStr,
              sign,
            });

            await this.prisma.content.create({
              data: {
                ...forecast,
                authorId: 'system',
                version: 1,
              },
            });
            generated++;
          }
        } catch (error) {
          this.logger.error(`Error generating weekly forecast for ${sign}:`, error);
        }
      }

      this.logger.log(`Weekly content generation completed. Generated: ${generated}`);
    } catch (error) {
      this.logger.error('Error in weekly content generation:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async backfillMissingContent() {
    this.logger.log('Starting content backfill...');
    
    try {
      // Находим даты без контента за последние 7 дней
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const missingDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(sevenDaysAgo.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = await this.prisma.content.count({
          where: {
            type: ContentType.DAILY_FORECAST,
            effectiveDate: dateStr,
          },
        });
        
        if (count === 0) {
          missingDates.push(dateStr);
        }
      }

      if (missingDates.length > 0) {
        this.logger.log(`Found ${missingDates.length} missing dates: ${missingDates.join(', ')}`);
        
        // Генерируем контент для пропущенных дат
        for (const date of missingDates) {
          await this.generateDailyContent();
        }
      }
    } catch (error) {
      this.logger.error('Error in content backfill:', error);
    }
  }
}






