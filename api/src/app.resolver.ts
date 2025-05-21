import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String, { description: 'Health-check' })
  hello() {
    return 'hello world';
  }
}
