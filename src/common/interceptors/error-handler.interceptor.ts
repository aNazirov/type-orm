import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { RequestContext } from '../decorators/request-context';
import { Utils } from '../utils';

export class Error implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const { startTime, uuid, type, path, ip, method, baseUrl } = context
      .switchToHttp()
      .getRequest().requestContext as RequestContext;

    return next.handle().pipe(
      catchError((error: Utils.Error) => {
        Logger.error(error.message);

        return throwError(() => {
          const message = `${method} ${baseUrl}${path} ${ip} ${uuid} failed with status ${
            error.code
          } after +${Date.now() - startTime}ms`;

          Logger.error(error.stack);
          Logger.error(message, type);

          if (error instanceof HttpException) {
            return error;
          }

          return new HttpException(error.message, error.code, {
            cause: error,
          });
        });
      }),
    );
  }
}
