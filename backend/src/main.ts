import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import * as path from 'node:path';
import 'dotenv/config';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Нормализация URL: `/content//bg2s.jpg` → `/content/bg2s.jpg`.
  //    Делаем это ДО того, как запрос дойдёт до express.static.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (typeof req.url === 'string' && req.url.includes('//')) {
      req.url = req.url.replace(/\/{2,}/g, '/');
    }
    next();
  });

  // 2. Ручная раздача статики — надёжнее, чем ServeStaticModule,
  //    потому что мы явно управляем порядком middleware.
  const staticPath = path.join(__dirname, '..', 'public', 'content', 'afisha');
  app.useStaticAssets(staticPath, {
    prefix: '/content/afisha/',
    fallthrough: true,
    index: false,
  });

  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}

bootstrap();
