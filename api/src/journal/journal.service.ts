import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service'; // Correct path
import { CreateJournalEntryInput } from './dto/create-journal-entry.input';
import { UpdateJournalEntryInput } from './dto/update-journal-entry.input';
import { RangeInput } from './dto/range.input';
import { User } from '../users/entities/user.entity'; // Assuming this is where User entity is defined
import { Prisma } from '@prisma/client';

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJournalEntryInput: CreateJournalEntryInput, user: User) {
    const { lines, ...entryData } = createJournalEntryInput;
    return this.prisma.journalEntry.create({
      data: {
        ...entryData,
        datetime: entryData.datetime ? new Date(entryData.datetime) : new Date(),
        createdById: user.id,
        lines: {
          create: lines.map(line => ({
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
          })),
        },
      },
      include: {
        lines: { include: { account: true } },
        createdBy: true,
      },
    });
  }

  async findAll(rangeInput?: RangeInput, user?: User) {
    const where: Prisma.JournalEntryWhereInput = {};
    if (rangeInput?.startDate) {
      where.datetime = { ...where.datetime, gte: new Date(rangeInput.startDate) };
    }
    if (rangeInput?.endDate) {
      where.datetime = { ...where.datetime, lte: new Date(rangeInput.endDate) };
    }
    if (rangeInput?.searchTerm) {
      where.description = { contains: rangeInput.searchTerm, mode: 'insensitive' };
    }
    // Optional: filter by createdById if user is provided
    // if (user) {
    //   where.createdById = user.id;
    // }
    return this.prisma.journalEntry.findMany({
      where,
      include: {
        lines: { include: { account: true } },
        createdBy: true,
      },
      orderBy: { datetime: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: { include: { account: true } },
        createdBy: true,
      },
    });
  }

  async update(id: number, updateJournalEntryInput: UpdateJournalEntryInput) {
    const { lines, ...entryData } = updateJournalEntryInput;
    
    const dataToUpdate: Prisma.JournalEntryUpdateInput = { ...entryData };
    if (entryData.datetime) {
      dataToUpdate.datetime = new Date(entryData.datetime);
    }

    if (lines) {
      dataToUpdate.lines = {
        deleteMany: {}, 
        create: lines.map(line => ({
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
        })),
      };
    }

    return this.prisma.journalEntry.update({
      where: { id },
      data: dataToUpdate,
      include: {
        lines: { include: { account: true } },
        createdBy: true,
      },
    });
  }

  async remove(id: number) {
    // Explicitly delete related JournalLines first
    await this.prisma.journalLine.deleteMany({ where: { entryId: id } });
    
    // Then delete the JournalEntry
    return this.prisma.journalEntry.delete({
      where: { id },
      // Optionally include related data if needed by the resolver upon deletion
      // For consistency with other methods, it's good practice to include it.
      include: {
        lines: { include: { account: true } }, // These will be empty due to prior deleteMany
        createdBy: true,
      }
    });
  }
}
