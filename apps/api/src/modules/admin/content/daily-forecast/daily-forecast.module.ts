import { Module } from '@nestjs/common';
import { DailyForecastController } from './daily-forecast.controller';
import { DailyForecastService } from './daily-forecast.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DailyForecastController],
  providers: [DailyForecastService],
  exports: [DailyForecastService],
})
export class DailyForecastModule {}



