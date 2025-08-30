import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminContentModule } from './modules/admin/content/admin-content.module';
import { PublicContentModule } from './modules/public/content/public-content.module';
import { GeneratorModule } from './modules/generator/generator.module';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    AdminContentModule,
    PublicContentModule,
    GeneratorModule,
    JobsModule,
  ],
})
export class AppModule {}



