import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  FilmsRepository,
  FILMS_REPOSITORY,
} from '../films/films.repository.interface';
import {
  OrderDto,
  OrderResponseDto,
  OrderResultDto,
  TicketDto,
} from './dto/order.dto';

type Plan = {
  filmId: string;
  sessionId: string;
  daytime: string;
  price: number;
  places: string[];
};

@Injectable()
export class OrderService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async create(order: OrderDto): Promise<OrderResponseDto> {
    if (!order?.tickets?.length) {
      throw new BadRequestException('Список билетов пуст');
    }

    // 1. Группируем билеты по (фильм, сеанс).
    const grouped = new Map<
      string,
      { filmId: string; sessionId: string; tickets: TicketDto[] }
    >();

    for (const ticket of order.tickets) {
      const key = `${ticket.film}:${ticket.session}`;
      let bucket = grouped.get(key);
      if (!bucket) {
        bucket = {
          filmId: ticket.film,
          sessionId: ticket.session,
          tickets: [],
        };
        grouped.set(key, bucket);
      }
      bucket.tickets.push(ticket);
    }

    // 2. Проверяем ВСЕ группы в памяти — до любых записей в БД.
    //    Если хоть одна проверка падает, в БД ничего не записано.
    const plans: Plan[] = [];

    for (const { filmId, sessionId, tickets } of grouped.values()) {
      const film = await this.filmsRepository.findById(filmId);
      if (!film) {
        throw new BadRequestException(`Фильм с id "${filmId}" не найден`);
      }

      const session = film.schedule.find((s) => s.id === sessionId);
      if (!session) {
        throw new BadRequestException(`Сеанс с id "${sessionId}" не найден`);
      }

      const takenSet = new Set(session.taken);
      const places: string[] = [];

      for (const ticket of tickets) {
        const { row, seat } = ticket;

        if (row < 1 || row > session.rows || seat < 1 || seat > session.seats) {
          throw new BadRequestException(
            `Некорректные координаты места: ${row}:${seat}`,
          );
        }

        const place = `${row}:${seat}`;

        if (takenSet.has(place)) {
          throw new BadRequestException(
            `Место ${row} ряд, ${seat} место уже занято`,
          );
        }

        takenSet.add(place);
        places.push(place);
      }

      plans.push({
        filmId,
        sessionId,
        daytime: session.daytime,
        price: session.price,
        places,
      });
    }

    // 3. Все проверки прошли. Записываем группы атомарно (каждая группа —
    //    один updateOne с $nin), с компенсацией при сбое поздней группы.
    const written: Plan[] = [];

    try {
      for (const plan of plans) {
        const ok = await this.filmsRepository.addTaken(
          plan.filmId,
          plan.sessionId,
          plan.places,
        );

        if (!ok) {
          throw new BadRequestException(
            'Место уже занято (кто-то успел забронировать параллельно)',
          );
        }

        written.push(plan);
      }
    } catch (error) {
      // Компенсация: снимаем места с уже записанных групп, чтобы не
      // осталось «занятых» мест без оформленного заказа.
      for (const plan of written) {
        await this.filmsRepository.removeTaken(
          plan.filmId,
          plan.sessionId,
          plan.places,
        );
      }
      throw error;
    }

    // 4. Формируем ответ.
    const items: OrderResultDto[] = [];

    for (const plan of plans) {
      for (const place of plan.places) {
        const [row, seat] = place.split(':').map(Number);
        items.push({
          id: randomUUID(),
          film: plan.filmId,
          session: plan.sessionId,
          daytime: plan.daytime,
          row,
          seat,
          price: plan.price,
        });
      }
    }

    return { total: items.length, items };
  }
}
