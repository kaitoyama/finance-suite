import { Resolver, Query, Mutation, Args, Int, ID, Context } from '@nestjs/graphql';
import { JournalService } from './journal.service';
import { JournalEntry } from './entities/journal-entry.entity';
import { CreateJournalEntryInput } from './dto/create-journal-entry.input';
import { UpdateJournalEntryInput } from './dto/update-journal-entry.input';
import { RangeInput } from './dto/range.input';
import { User } from '../users/entities/user.entity'; // Import User entity
import { UseGuards, UsePipes } from '@nestjs/common'; // Added UsePipes
import { BalanceValidationPipe } from './pipes/balance-validation.pipe'; // Import the pipe
// import { GqlAuthGuard } from '../auth/guards/gql-auth.guard'; // Example guard
// import { CurrentUser } from '../auth/decorators/current-user.decorator'; // Example for user

@Resolver(() => JournalEntry)
export class JournalResolver {
  constructor(private readonly journalService: JournalService) {}

  @Mutation(() => JournalEntry)
  @UsePipes(BalanceValidationPipe) // Apply the pipe here
  async createJournalEntry(
    @Args('createJournalEntryInput') createJournalEntryInput: CreateJournalEntryInput,
    @Context() context: any, // Access GraphQL context
    // @CurrentUser() user: User, // Assuming CurrentUser decorator provides the user
  ) {
    // The subtask mentions X-Forwarded-User middleware populating req.user.
    // In NestJS GraphQL, this would typically be mapped to context.req.user.
    const user = context.req?.user as User; 

    // Fallback to mock user if not found in context (for environments where middleware isn't set up)
    const effectiveUser = user || { id: 1, username: 'testuser', isAdmin: false, name: 'Test User' } as User;
    if (!user) {
      console.warn("User not found in GraphQL context, using mock user for createJournalEntry.");
    }
    
    return this.journalService.create(createJournalEntryInput, effectiveUser);
  }

  @Query(() => [JournalEntry], { name: 'journalEntries' })
  // @UseGuards(GqlAuthGuard) // Example: Protect this query
  async journalEntries(
     @Args('range', { type: () => RangeInput, nullable: true }) range?: RangeInput,
     // @CurrentUser() user?: User, // If filtering by user or for user-specific data
  ) {
    // Pass user to service if needed for filtering, e.g., based on user permissions or ownership
    // const user = context.req?.user as User; 
    // return this.journalService.findAll(range, user); 
    return this.journalService.findAll(range);
  }

  @Query(() => JournalEntry, { name: 'journalEntry', nullable: true })
  // @UseGuards(GqlAuthGuard) // Example: Protect this query
  async journalEntry(@Args('id', { type: () => ID }) id: number) {
    return this.journalService.findOne(id);
  }

  @Mutation(() => JournalEntry)
  @UsePipes(BalanceValidationPipe) // Apply the pipe here
  async updateJournalEntry(
    @Args('updateJournalEntryInput') updateJournalEntryInput: UpdateJournalEntryInput,
  ) {
    return this.journalService.update(updateJournalEntryInput.id, updateJournalEntryInput);
  }

  @Mutation(() => JournalEntry, { nullable: true }) // Or return a boolean/ID
  // @UseGuards(GqlAuthGuard) // Example: Protect this mutation
  async removeJournalEntry(@Args('id', { type: () => ID }) id: number) {
    return this.journalService.remove(id);
  }
}
