import { Film } from './entities/film.entity';

export interface FilmsRepository {
  findAll(): Promise<Film[]>;
  findById(id: string): Promise<Film | null>;
  addTaken(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<boolean>;
  removeTaken(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<void>;
}

export const FILMS_REPOSITORY = Symbol('FILMS_REPOSITORY');
