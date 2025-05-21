import { Resolver, Query, Context } from '@nestjs/graphql';
import { Request } from 'express';
import { MeDto } from './dto/me.dto';

@Resolver(() => MeDto)
export class MeResolver {
  /**
   * GraphQL Query: me
   * - JWT 検証などは行わず、ミドルウェアが付与した
   *   req.username / req.isAdmin をそのまま返す
   */
  @Query(() => MeDto, { description: '現在のユーザーを返す' })
  me(@Context('req') req: Request): MeDto {
    return {
      username: req.username ?? '',
      isAdmin: !!req.isAdmin,
    };
  }
}
