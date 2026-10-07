import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private write(
    level: string,
    message: unknown,
    ...optionalParams: unknown[]
  ): void {
    const fields: Record<string, string> = {
      level,
      message: this.stringify(message),
      time: new Date().toISOString(),
    };

    if (optionalParams.length > 0) {
      fields.optionalParams = this.stringify(optionalParams);
    }

    const line = Object.entries(fields)
      .map(([key, value]) => `${key}=${value}`)
      .join('\t');

    console.log(line);
  }

  /**
   * TSKV не поддерживает \t и \n внутри значений — экранируем пробелами.
   * Объекты/массивы сериализуем в JSON.
   */
  private stringify(value: unknown): string {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    return raw.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('log', message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, ...optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, ...optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, ...optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, ...optionalParams);
  }
}
