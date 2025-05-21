import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserHeaderMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const username = req.header('x-forwarded-user') ?? '';
    if (username === ''){
      // ないなら、アクセス拒否
      return next(new UnauthorizedException());
    }

    // ② .env の ADMIN_USERS=alice,bob を配列化
    const admins = process.env.ADMIN_USERS?.split(',') ?? [];

    // ③ リクエストオブジェクトに詰める
    req.username = username;
    req.isAdmin = admins.includes(username);

    next();
  }
}
