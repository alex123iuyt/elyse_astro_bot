import { ApiProperty } from '@nestjs/swagger';
import { UpsertContentDto } from './upsert-content.dto';

export class ContentResponseDto extends UpsertContentDto {
  @ApiProperty({ description: 'ID контента' })
  id: string;

  @ApiProperty({ description: 'Версия контента' })
  version: number;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: string;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: string;

  @ApiProperty({ required: false, description: 'ID автора' })
  authorId?: string;

  @ApiProperty({ required: false, description: 'Имя автора' })
  authorName?: string;
}






