import { Injectable, NotFoundException } from '@nestjs/common';
import { FilmsRepository } from './films.repository';
import { Film } from './films.schema';
import { FilmDto, FilmsListDto, ScheduleListDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async findAll(): Promise<FilmsListDto> {
    const films = await this.filmsRepository.findAll();
    return {
      total: films.length,
      items: films.map((film) => this.toFilmDto(film)),
    };
  }

  async findSchedule(id: string): Promise<ScheduleListDto> {
    const film = await this.filmsRepository.findById(id);
    if (!film) {
      throw new NotFoundException(`Фильм с id "${id}" не найден`);
    }
    return {
      total: film.schedule.length,
      items: film.schedule.map((item) => ({
        id: item.id,
        daytime: item.daytime,
        hall: item.hall,
        rows: item.rows,
        seats: item.seats,
        price: item.price,
        taken: item.taken,
      })),
    };
  }

  private toFilmDto(film: Film): FilmDto {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    };
  }
}
