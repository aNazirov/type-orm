import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import * as crypto from 'crypto';
import { Observable, tap } from 'rxjs';
import { RequestContext } from '../decorators/request-context';

export class Context implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const startTime = Date.now();
    const { ip, method, path, baseUrl } = context.switchToHttp().getRequest();

    context.switchToHttp().getRequest().requestContext = {
      ip,
      path,
      method,
      baseUrl,
      startTime,
      uuid: crypto.randomUUID(),
      type: context.getType().toUpperCase(),
    } satisfies RequestContext;

    return next.handle().pipe(
      tap(() => {
        context.switchToHttp().getRequest().requestContext = undefined;
      }),
    );
  }
}
