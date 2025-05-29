import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { DatabaseConfigService } from './config/database.config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DatabaseConfigService, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
