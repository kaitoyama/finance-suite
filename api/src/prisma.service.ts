import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DatabaseConfigService } from './config/database.config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private databaseConfig: DatabaseConfigService) {
    super({
      datasources: {
        db: {
          url: databaseConfig.getDatabaseUrl(),
        },
      },
    });
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('Running database migrations in production...');
      try {
        const databaseUrl = this.databaseConfig.getDatabaseUrl();
        await execAsync('npx prisma migrate deploy', {
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
          },
        });
        this.logger.log('Database migrations completed successfully');
      } catch (error) {
        this.logger.error('Failed to run database migrations:', error);
        throw error;
      }
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
