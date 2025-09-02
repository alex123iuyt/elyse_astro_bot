import { IsEnum, IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType, PublishStatus, ZodiacSign } from '@prisma/client';

export class ContentQueryDto {
  @ApiProperty({ required: false, description: 'Поисковый запрос' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ enum: ContentType, required: false, description: 'Тип контента' })
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @ApiProperty({ enum: PublishStatus, required: false, description: 'Статус публикации' })
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

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

  @ApiProperty({ required: false, description: 'Локаль' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ required: false, description: 'Теги', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, description: 'Страница', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Лимит на страницу', default: 20 })
  @IsOptional()
  limit?: number = 20;
}






