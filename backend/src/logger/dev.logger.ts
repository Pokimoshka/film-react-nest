import { Injectable, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class DevLogger extends ConsoleLogger {
  // Наследуем поведение ConsoleLogger — цвета и формат из коробки.
  // При необходимости можно переопределить методы (например, добавить контекст).
}
