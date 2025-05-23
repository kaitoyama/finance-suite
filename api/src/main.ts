import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOに定義されていないプロパティを自動的に除去
      forbidNonWhitelisted: true, // DTOに定義されていないプロパティが含まれている場合、リクエストを拒否
      transform: true, // リクエストのペイロードをDTOの型に変換
      transformOptions: {
        enableImplicitConversion: true, // 暗黙的な型変換を有効にする (例: string -> number)
      },
    }),
  );

  // CORS configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001'; // 環境変数から読み込むか、デフォルト値を設定
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
