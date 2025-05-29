import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { JournalService } from './journal.service';
import { JournalEntry } from './entities/journal-entry.entity';
import { CreateJournalEntryInput } from './dto/create-journal-entry.input';
import { UpdateJournalEntryInput } from './dto/update-journal-entry.input';
import { RangeInput } from './dto/range.input';
import { User } from '../users/entities/user.entity'; // Import User entity
import { UserService } from '../users/user.service'; // Import UserService
import { UsePipes, NotFoundException } from '@nestjs/common'; // Added UsePipes and NotFoundException
import { BalanceCheckPipe } from './pipes/balance-check.pipe'; // Import the pipe
import { Request } from 'express'; // Import typed Express Request
import { JournalEntry as JournalEntryModel } from '@prisma/client';
@Resolver(() => JournalEntry)
export class JournalResolver {
  constructor(
    private readonly journalService: JournalService,
    private readonly userService: UserService, // Inject UserService
  ) {}

  @Mutation(() => JournalEntry)
  @UsePipes(BalanceCheckPipe) // Apply the pipe here
  async createJournalEntry(
    @Args('createJournalEntryInput')
    createJournalEntryInput: CreateJournalEntryInput,
    @Context('req') req: Request, // Typed Express request with username/isAdmin
  ): Promise<JournalEntryModel> {
    const username = req.username!;
    const isAdmin = req.isAdmin || false; // Default to false if undefined

    // Find or create the user based on username from the header
    const user = await this.userService.findOrCreateByUsername(
      username,
      isAdmin,
    );
    // No need to check if user is null/undefined as findOrCreateByUsername will always return a user or throw

    return this.journalService.create(createJournalEntryInput, user);
  }

  @Query(() => [JournalEntry], { name: 'journalEntries' })
  // @UseGuards(GqlAuthGuard) // Example: Protect this query
  async journalEntries(
    @Args('range', { type: () => RangeInput, nullable: true })
    range?: RangeInput,
    // @CurrentUser() user?: User, // If filtering by user or for user-specific data
  ): Promise<JournalEntryModel[]> {
    // Pass user to service if needed for filtering, e.g., based on user permissions or ownership
    // const user = context.req?.user as User;
    // return this.journalService.findAll(range, user);
    return this.journalService.findAll(range);
  }

  @Query(() => JournalEntry, { name: 'journalEntry', nullable: true })
  // @UseGuards(GqlAuthGuard) // Example: Protect this query
  async journalEntry(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<JournalEntryModel | null> {
    return this.journalService.findOne(id);
  }

  @Mutation(() => JournalEntry)
  @UsePipes(BalanceCheckPipe) // Apply the pipe here
  async updateJournalEntry(
    @Args('updateJournalEntryInput')
    updateJournalEntryInput: UpdateJournalEntryInput,
  ): Promise<JournalEntryModel> {
    return this.journalService.update(
      updateJournalEntryInput.id,
      updateJournalEntryInput,
    );
  }

  @Mutation(() => JournalEntry, { nullable: true }) // Or return a boolean/ID
  // @UseGuards(GqlAuthGuard) // Example: Protect this mutation
  async removeJournalEntry(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<JournalEntryModel> {
    return this.journalService.remove(id);
  }
}
