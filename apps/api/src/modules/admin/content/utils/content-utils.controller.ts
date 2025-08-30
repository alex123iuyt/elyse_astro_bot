import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ContentUtilsService } from './content-utils.service';

@ApiTags('Content Utils')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/content/utils')
export class ContentUtilsController {
  constructor(private readonly contentUtilsService: ContentUtilsService) {}

  @Post('copy-yesterday')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Копировать вчерашний контент на сегодня' })
  @ApiResponse({ status: 200, description: 'Контент скопирован' })
  async copyYesterday() {
    return this.contentUtilsService.copyYesterdayContent();
  }

  @Post('generate-today')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Сгенерировать контент на сегодня' })
  @ApiResponse({ status: 200, description: 'Контент сгенерирован' })
  async generateToday() {
    return this.contentUtilsService.generateTodayContent();
  }
}



