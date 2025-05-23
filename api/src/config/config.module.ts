// api/src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ← 全モジュールで env 利用可
      cache: true,
      envFilePath: ['.env'], // デフォルトは .env
    }),
  ],
})
export class GlobalConfigModule {}
