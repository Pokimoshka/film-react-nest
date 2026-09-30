import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from './films.schema';

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectModel(Film.name)
    private readonly filmModel: Model<FilmDocument>,
  ) {}

  async findAll(): Promise<Film[]> {
    return this.filmModel.find().lean<Film[]>().exec();
  }

  async findById(id: string): Promise<Film | null> {
    return this.filmModel.findOne({ id }).lean<Film | null>().exec();
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

    const result = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: {
            $elemMatch: {
              id: sessionId,
              taken: { $nin: places },
            },
          },
        },
        {
          $push: {
            'schedule.$.taken': { $each: places },
          },
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  /**
   * Компенсирующая операция: убирает места из taken.
   * Используется для отката, если запись одной из групп заказа упала.
   */
  async removeTaken(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<void> {
    if (places.length === 0) return;

    await this.filmModel
      .updateOne(
        { id: filmId, 'schedule.id': sessionId },
        { $pull: { 'schedule.$.taken': { $in: places } } },
      )
      .exec();
  }
}
