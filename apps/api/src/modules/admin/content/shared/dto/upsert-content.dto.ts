import { IsEnum, IsOptional, IsString, IsArray, IsDateString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType, PublishStatus, Visibility, ZodiacSign } from '@prisma/client';

export class UpsertContentDto {
  @ApiProperty({ enum: ContentType, description: 'Тип контента' })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({ required: false, description: 'Заголовок контента' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: 'URL-слаг' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false, description: 'Содержимое (JSON блоки)' })
  @IsOptional()
  @IsObject()
  body?: unknown;

  @ApiProperty({ required: false, description: 'Краткое описание' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ required: false, description: 'Теги', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ enum: PublishStatus, required: false, description: 'Статус публикации' })
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @ApiProperty({ enum: Visibility, required: false, description: 'Видимость' })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiProperty({ required: false, description: 'Локаль' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ enum: ZodiacSign, required: false, description: 'Знак зодиака' })
  @IsOptional()
  @IsEnum(ZodiacSign)
  sign?: ZodiacSign;

  @ApiProperty({ required: false, description: 'Дата начала (ISO)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ required: false, description: 'Дата окончания (ISO)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ required: false, description: 'Эффективная дата (ISO)' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiProperty({ required: false, description: 'Дополнительные мета-данные' })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}






