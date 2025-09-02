import { Module } from '@nestjs/common';
import { DailyForecastModule } from './daily-forecast/daily-forecast.module';
import { ContentUtilsController } from './utils/content-utils.controller';
import { ContentUtilsService } from './utils/content-utils.service';
import { BulkContentController } from './bulk/bulk-content.controller';
import { BulkContentService } from './bulk/bulk-content.service';

@Module({
  imports: [
    DailyForecastModule,
    // TODO: Добавить остальные модули для типов контента
  ],
  controllers: [
    ContentUtilsController,
    BulkContentController,
  ],
  providers: [
    ContentUtilsService,
    BulkContentService,
  ],
  exports: [
    DailyForecastModule,
  ],
})
export class AdminContentModule {}






