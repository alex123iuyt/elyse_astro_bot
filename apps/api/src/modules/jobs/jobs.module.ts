import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { GeneratorModule } from '../generator/generator.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    GeneratorModule,
  ],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}



