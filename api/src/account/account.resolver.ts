import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import { CreateAccountInput } from './dto/create-account.input';

@Resolver(() => Account)
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Mutation(() => Account)
  createAccount(
    @Args('createAccountInput') createAccountInput: CreateAccountInput,
  ) {
    return this.accountService.create(createAccountInput);
  }

  @Query(() => [Account], { name: 'accounts' })
  findAll() {
    return this.accountService.findAll();
  }

  @Query(() => Account, { name: 'account', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.accountService.findOne(id);
  }
}
