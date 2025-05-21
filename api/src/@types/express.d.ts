// api/src/@types/express.d.ts
import 'express';

declare module 'express' {
  interface Request {
    username?: string;
    isAdmin?: boolean;
  }
}
