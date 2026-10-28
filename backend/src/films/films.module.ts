import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { TypeOrmFilmsRepository } from './films.repository';
import { FILMS_REPOSITORY } from './films.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Film, Schedule])],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    {
      provide: FILMS_REPOSITORY,
      useClass: TypeOrmFilmsRepository,
    },
  ],
  exports: [FILMS_REPOSITORY],
})
export class FilmsModule {}
