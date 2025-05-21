import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserHeaderMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // ① X-Forwarded-User が無ければ anonymous 扱い
    const username = req.header('x-forwarded-user') ?? 'anonymous';

    // ② .env の ADMIN_USERS=alice,bob を配列化
    const admins = process.env.ADMIN_USERS?.split(',') ?? [];

    // ③ リクエストオブジェクトに詰める
    req.username = username;
    req.isAdmin = admins.includes(username);

    next();
  }
}
