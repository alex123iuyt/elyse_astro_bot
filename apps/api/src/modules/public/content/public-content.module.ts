import { Module } from '@nestjs/common';
import { PublicContentController } from './public-content.controller';
import { PublicContentService } from './public-content.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PublicContentController],
  providers: [PublicContentService],
  exports: [PublicContentService],
})
export class PublicContentModule {}



