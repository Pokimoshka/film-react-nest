import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  private write(
    level: string,
    message: unknown,
    ...optionalParams: unknown[]
  ): void {
    console.log(
      JSON.stringify({
        level,
        message,
        optionalParams,
        timestamp: new Date().toISOString(),
      }),
    );
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
