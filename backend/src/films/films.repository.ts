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
   * Атомарно обновляет список занятых мест для конкретного сеанса.
   */
  async updateTaken(
    filmId: string,
    sessionId: string,
    taken: string[],
  ): Promise<void> {
    await this.filmModel
      .updateOne(
        { id: filmId, 'schedule.id': sessionId },
        { $set: { 'schedule.$.taken': taken } },
      )
      .exec();
  }
}
