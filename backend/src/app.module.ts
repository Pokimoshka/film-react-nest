import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configProvider } from './app.config.provider';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Film } from './films/entities/film.entity';
import { Schedule } from './films/entities/schedule.entity';
import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const driver = configService.get<string>('DATABASE_DRIVER', 'postgres');
        if (driver !== 'postgres') {
          throw new Error(
            `Unsupported DATABASE_DRIVER: "${driver}". Only "postgres" is supported.`,
          );
        }
        return {
          type: 'postgres' as const,
          url: configService.get<string>(
            'DATABASE_URL',
            'postgres://localhost:5432/exampledb',
          ),
          username: configService.get<string>(
            'DATABASE_USERNAME',
            'exampleuser',
          ),
          password: configService.get<string>(
            'DATABASE_PASSWORD',
            'examplepass',
          ),
          entities: [Film, Schedule],
          synchronize: false,
          autoLoadEntities: true,
          retryAttempts: 1,
          retryDelay: 1000,
        };
      },
    }),
    FilmsModule,
    OrderModule,
  ],
  controllers: [],
  providers: [
    configProvider,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
