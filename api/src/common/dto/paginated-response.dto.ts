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

export function createPaginatedType<T>(ItemType: any) {
  @ObjectType(`Paginated${ItemType.name}Response`)
  class PaginatedResponse {
    @Field(() => [ItemType])
    items: T[];

    @Field(() => PaginationInfo)
    pagination: PaginationInfo;
  }
  return PaginatedResponse;
}