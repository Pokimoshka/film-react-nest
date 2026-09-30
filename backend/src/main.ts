import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as path from 'node:path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Нормализация повторных слешей в URL: /content//bg1s.jpg → /content/bg1s.jpg.
  // Нужна, чтобы serve-static корректно разрешал путь, когда клиент шлёт «//».
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (typeof req.url === 'string' && req.url.includes('//')) {
      req.url = req.url.replace(/\/{2,}/g, '/');
    }
    next();
  });

  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: '/content/afisha/',
    fallthrough: true,
    index: false,
  });

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/afisha');
  app.enableCors();

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap();