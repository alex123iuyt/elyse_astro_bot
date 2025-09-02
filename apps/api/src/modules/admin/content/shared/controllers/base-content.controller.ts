import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BaseContentService } from '../services/base-content.service';
import { UpsertContentDto } from '../dto/upsert-content.dto';
import { ContentQueryDto } from '../dto/content-query.dto';
import { ContentResponseDto } from '../dto/content-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Content Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/content')
export abstract class BaseContentController {
  constructor(
    protected readonly contentService: BaseContentService,
    protected readonly contentType: string,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Получить список контента' })
  @ApiResponse({ status: 200, description: 'Список контента', type: [ContentResponseDto] })
  async findAll(@Query() query: ContentQueryDto) {
    return this.contentService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Получить контент по ID' })
  @ApiResponse({ status: 200, description: 'Контент', type: ContentResponseDto })
  async findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Создать новый контент' })
  @ApiResponse({ status: 201, description: 'Контент создан', type: ContentResponseDto })
  async create(@Body() dto: UpsertContentDto, @Request() req: any) {
    return this.contentService.create(dto, req.user.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Обновить контент' })
  @ApiResponse({ status: 200, description: 'Контент обновлен', type: ContentResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpsertContentDto, @Request() req: any) {
    return this.contentService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Удалить контент (архивировать)' })
  @ApiResponse({ status: 200, description: 'Контент удален' })
  async delete(@Param('id') id: string) {
    return this.contentService.delete(id);
  }

  @Post(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Опубликовать контент' })
  @ApiResponse({ status: 200, description: 'Контент опубликован', type: ContentResponseDto })
  async publish(@Param('id') id: string) {
    return this.contentService.publish(id);
  }
}






