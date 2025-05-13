import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WithContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.requestContext;
  },
);

export type RequestContext = {
  ip: string;
  uuid: string;
  startTime: number;
  type: string;
  method: string;
  path: string;
  baseUrl: string;
  endTime?: number;
  errorTime?: number;
};
