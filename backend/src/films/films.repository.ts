import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmsRepository } from './films.repository.interface';

@Injectable()
export class TypeOrmFilmsRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Film[]> {
    return this.filmRepository.find({
      relations: { schedule: true },
      order: { schedule: { daytime: 'ASC' } },
    });
  }

  async findById(id: string): Promise<Film | null> {
    return this.filmRepository.findOne({
      where: { id },
      relations: { schedule: true },
      order: { schedule: { daytime: 'ASC' } },
    });
  }

  /**
   * Атомарно добавляет места в taken конкретного сеанса, только если ни одно
   * из этих мест ещё не занято.
   *
   * Возвращает true, если места были записаны; false — если хотя бы одно
   * место уже занято (в том числе параллельным запросом).
   */
  async addTaken(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<boolean> {
    if (places.length === 0) return true;

    return this.dataSource.transaction(async (manager) => {
      const schedule = await manager.findOne(Schedule, {
        where: { id: sessionId, filmId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!schedule) return false;

      const takenSet = new Set(schedule.taken);
      for (const place of places) {
        if (takenSet.has(place)) return false;
      }

      schedule.taken = [...schedule.taken, ...places];
      await manager.save(schedule);
      return true;
    });
  }

  /**
   * Компенсирующая операция: убирает места из taken.
   */
  async removeTaken(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<void> {
    if (places.length === 0) return;

    await this.dataSource.transaction(async (manager) => {
      const schedule = await manager.findOne(Schedule, {
        where: { id: sessionId, filmId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!schedule) return;

      const drop = new Set(places);
      schedule.taken = schedule.taken.filter((p) => !drop.has(p));
      await manager.save(schedule);
    });
  }
}
