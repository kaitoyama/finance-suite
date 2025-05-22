import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface UserHeaderInfo {
  username: string;
  isAdmin: boolean;
}

export const UserHeader = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserHeaderInfo => {
    const gqlCtx = GqlExecutionContext.create(context);
    const req = gqlCtx.getContext().req;
    // Assuming middleware adds username and isAdmin to req directly or to req.user
    if (req.user && typeof req.user.username === 'string' && typeof req.user.isAdmin === 'boolean') {
      return { username: req.user.username, isAdmin: req.user.isAdmin };
    }
    // Fallback if middleware adds directly to req
    if (typeof req.username === 'string' && typeof req.isAdmin === 'boolean') {
      return { username: req.username, isAdmin: req.isAdmin };
    }
    // Handle cases where user info might not be available or is in a different format
    // You might want to throw an error or return a default/undefined value
    console.warn('UserHeader decorator could not find username or isAdmin on request.');
    // Return a default or throw an error as appropriate for your application
    return { username: 'unknown', isAdmin: false }; 
  },
); 