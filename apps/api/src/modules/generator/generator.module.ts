import { Module } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GeneratorService],
  exports: [GeneratorService],
})
export class GeneratorModule {}






