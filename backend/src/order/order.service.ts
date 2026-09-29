import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FilmsRepository } from '../films/films.repository';
import {
  OrderDto,
  OrderResponseDto,
  OrderResultDto,
  TicketDto,
} from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async create(order: OrderDto): Promise<OrderResponseDto> {
    if (!order?.tickets?.length) {
      throw new BadRequestException('Список билетов пуст');
    }

    // Группируем билеты по (фильм, сеанс), чтобы сделать одну запись в БД.
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

    const items: OrderResultDto[] = [];

    for (const { filmId, sessionId, tickets } of grouped.values()) {
      const film = await this.filmsRepository.findById(filmId);
      if (!film) {
        throw new BadRequestException(`Фильм с id "${filmId}" не найден`);
      }

      const session = film.schedule.find((s) => s.id === sessionId);
      if (!session) {
        throw new BadRequestException(`Сеанс с id "${sessionId}" не найден`);
      }

      // Локальный Set, чтобы отсечь дубли внутри одного запроса.
      const takenSet = new Set(session.taken);

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

        items.push({
          id: randomUUID(),
          film: filmId,
          session: sessionId,
          daytime: session.daytime,
          row,
          seat,
          price: session.price,
        });
      }

      await this.filmsRepository.updateTaken(
        filmId,
        sessionId,
        Array.from(takenSet),
      );
    }

    return { total: items.length, items };
  }
}
