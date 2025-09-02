import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { BulkContentService } from './bulk-content.service';

class BulkContentDto {
  contentIds: string[];
}

@ApiTags('Bulk Content Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/content/bulk')
export class BulkContentController {
  constructor(private readonly bulkContentService: BulkContentService) {}

  @Post('publish')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Массовая публикация контента' })
  @ApiResponse({ status: 200, description: 'Контент опубликован' })
  async bulkPublish(@Body() dto: BulkContentDto) {
    return this.bulkContentService.bulkPublish(dto.contentIds);
  }

  @Post('archive')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Массовое архивирование контента' })
  @ApiResponse({ status: 200, description: 'Контент заархивирован' })
  async bulkArchive(@Body() dto: BulkContentDto) {
    return this.bulkContentService.bulkArchive(dto.contentIds);
  }

  @Post('delete')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Массовое удаление контента' })
  @ApiResponse({ status: 200, description: 'Контент удален' })
  async bulkDelete(@Body() dto: BulkContentDto) {
    return this.bulkContentService.bulkDelete(dto.contentIds);
  }
}






