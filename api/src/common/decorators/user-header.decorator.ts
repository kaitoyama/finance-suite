import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export interface UserHeaderInfo {
  username: string;
  isAdmin: boolean;
}

interface GraphQLContext {
  req: Request;
}

export const UserHeader = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserHeaderInfo => {
    const gqlCtx = GqlExecutionContext.create(context);
    const { req }: GraphQLContext = gqlCtx.getContext();

    // middlewareによってusernameとisAdminが設定されているので、それらを直接使用
    const username = req.username;
    const isAdmin = req.isAdmin;

    // middlewareを信頼し、設定された値をそのまま使用
    if (typeof username === 'string' && typeof isAdmin === 'boolean') {
      return { username, isAdmin };
    }

    // middlewareが正しく動作していない場合の fallback
    console.warn(
      'UserHeader decorator could not find username or isAdmin on request.',
    );
    return { username: 'unknown', isAdmin: false };
  },
);
