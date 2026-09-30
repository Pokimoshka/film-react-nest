import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.extractMessage(exception.getResponse(), message);
    } else if (exception && typeof exception === 'object') {
      const err = exception as Record<string, unknown>;

      if (typeof err.status === 'number') status = err.status;
      else if (typeof err.statusCode === 'number') status = err.statusCode;

      if (typeof err.message === 'string' && err.message.length > 0) {
        message = err.message;
      } else if (typeof err.code === 'string') {
        message = err.code;
      }

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(exception);
      }
    } else {
      this.logger.error(exception);
    }

    response.status(status).json({ error: message });
  }

  private extractMessage(body: unknown, fallback: string): string {
    if (typeof body === 'string') return body;
    if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      if (typeof obj.error === 'string') return obj.error;
      if (typeof obj.message === 'string') return obj.message;
      if (Array.isArray(obj.message)) return obj.message.join('; ');
    }
    return fallback;
  }
}