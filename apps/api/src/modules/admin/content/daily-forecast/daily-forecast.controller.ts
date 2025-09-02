import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseContentController } from '../shared/controllers/base-content.controller';
import { DailyForecastService } from './daily-forecast.service';

@ApiTags('Daily Forecasts')
@Controller('admin/content/daily-forecast')
export class DailyForecastController extends BaseContentController {
  constructor(contentService: DailyForecastService) {
    super(contentService, 'daily-forecast');
  }
}






