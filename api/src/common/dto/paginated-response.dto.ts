import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  limit: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

import { Type } from '@nestjs/common';

export function createPaginatedType<T>(
  ItemType: Type<T>,
): Type<{ items: T[]; pagination: PaginationInfo }> {
  @ObjectType(`Paginated${ItemType.name}Response`)
  class PaginatedResponse {
    @Field(() => [ItemType])
    items: T[];

    @Field(() => PaginationInfo)
    pagination: PaginationInfo;
  }
  return PaginatedResponse;
}
