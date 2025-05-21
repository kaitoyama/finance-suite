import { Resolver, Query, Mutation, Args, Int, ID, Context } from '@nestjs/graphql';
import { JournalService } from './journal.service';
import { JournalEntry } from './entities/journal-entry.entity';
import { CreateJournalEntryInput } from './dto/create-journal-entry.input';
import { UpdateJournalEntryInput } from './dto/update-journal-entry.input';
import { RangeInput } from './dto/range.input';
import { User } from '../users/entities/user.entity'; // Import User entity
import { UseGuards, UsePipes } from '@nestjs/common'; // Added UsePipes
import { BalanceCheckPipe } from './pipes/balance-check.pipe'; // Import the pipe
import { Request } from 'express'; // Import typed Express Request

@Resolver(() => JournalEntry)
export class JournalResolver {
  constructor(private readonly journalService: JournalService) {}

  @Mutation(() => JournalEntry)
  @UsePipes(BalanceCheckPipe) // Apply the pipe here
  async createJournalEntry(
    @Args('createJournalEntryInput') createJournalEntryInput: CreateJournalEntryInput,
    @Context('req') req: Request, // Typed Express request with username/isAdmin
  ) {
    // Access typed properties from middleware
    const username = req.username!;
    const isAdmin = req.isAdmin!;
    
    // Construct or lookup a User entity based on the header
    const effectiveUser = { username, isAdmin } as User;
    
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
  @UsePipes(BalanceCheckPipe) // Apply the pipe here
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
