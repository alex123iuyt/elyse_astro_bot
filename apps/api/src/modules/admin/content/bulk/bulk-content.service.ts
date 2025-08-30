import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublishStatus } from '@prisma/client';

@Injectable()
export class BulkContentService {
  constructor(private readonly prisma: PrismaService) {}

  async bulkPublish(contentIds: string[]): Promise<{ published: number; errors: string[] }> {
    const errors: string[] = [];
    let published = 0;

    for (const id of contentIds) {
      try {
        await this.prisma.content.update({
          where: { id },
          data: { status: PublishStatus.PUBLISHED },
        });
        published++;
      } catch (error) {
        errors.push(`Ошибка публикации ${id}: ${error.message}`);
      }
    }

    return { published, errors };
  }

  async bulkArchive(contentIds: string[]): Promise<{ archived: number; errors: string[] }> {
    const errors: string[] = [];
    let archived = 0;

    for (const id of contentIds) {
      try {
        await this.prisma.content.update({
          where: { id },
          data: { status: PublishStatus.ARCHIVED },
        });
        archived++;
      } catch (error) {
        errors.push(`Ошибка архивирования ${id}: ${error.message}`);
      }
    }

    return { archived, errors };
  }

  async bulkDelete(contentIds: string[]): Promise<{ deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let deleted = 0;

    for (const id of contentIds) {
      try {
        await this.prisma.content.delete({
          where: { id },
        });
        deleted++;
      } catch (error) {
        errors.push(`Ошибка удаления ${id}: ${error.message}`);
      }
    }

    return { deleted, errors };
  }
}



