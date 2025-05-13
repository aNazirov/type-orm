import {
  CallHandler,
  ExecutionContext,
  Logger as NestLogger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestContext } from '../decorators/request-context';

export class Logger implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const { startTime, uuid, type, path, ip, method, baseUrl } = context
      .switchToHttp()
      .getRequest().requestContext as RequestContext;

    NestLogger.log(`${method} ${baseUrl}${path} ${ip} ${uuid}`, type);

    const { statusCode } = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        NestLogger.log(
          `${method} ${baseUrl}${path} ${statusCode} ${ip} ${uuid} - +${
            Date.now() - startTime
          }ms`,
          type,
        );
      }),
    );
  }
}
