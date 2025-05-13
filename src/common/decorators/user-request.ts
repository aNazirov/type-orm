import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserRequestData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export type UserRequest = {
  uId: number;
  iat: number;
  exp: number;

  token: string;
};
