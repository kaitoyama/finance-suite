import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Correct path
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

    // Validation 1: Lines existence and minimum count
    if (!lines || lines.length < 2) {
      throw new BadRequestException(
        'Journal entry must have at least two lines.',
      );
    }

    // Validation 2: Debit/Credit balance
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    }
    if (totalDebit !== totalCredit) {
      throw new BadRequestException('Total debit must equal total credit.');
    }
    if (totalDebit === 0) {
      // Also implies totalCredit is 0
      throw new BadRequestException(
        'Journal entry total amount cannot be zero.',
      );
    }

    // Validation 3 & 4: Individual line validation and Account existence
    for (const line of lines) {
      if (line.debit && line.credit && line.debit !== 0 && line.credit !== 0) {
        throw new BadRequestException(
          `Line for account ID ${line.accountId} cannot have both debit and credit amounts.`,
        );
      }
      if (!line.debit && !line.credit) {
        throw new BadRequestException(
          `Line for account ID ${line.accountId} must have either a debit or a credit amount.`,
        );
      }
      if (
        (line.debit && line.debit <= 0) ||
        (line.credit && line.credit <= 0)
      ) {
        throw new BadRequestException(
          `Amounts for account ID ${line.accountId} must be positive.`,
        );
      }

      const accountExists = await this.prisma.account.findUnique({
        where: { id: line.accountId },
      });
      if (!accountExists) {
        throw new NotFoundException(
          `Account with ID ${line.accountId} not found.`,
        );
      }
    }

    return this.prisma.journalEntry.create({
      data: {
        ...entryData,
        datetime: entryData.datetime
          ? new Date(entryData.datetime)
          : new Date(),
        createdById: user.id,
        lines: {
          create: lines.map((line) => ({
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
    const where: Prisma.JournalEntryWhereInput = {}; // where句のベースオブジェクト

    // datetime範囲のフィルタを正しく処理する
    const dateTimeFilter: Prisma.DateTimeFilter = {}; // datetime条件を格納するオブジェクトを初期化
    let hasDateTimeFilterConditions = false; // 日付条件が設定されたかのフラグ

    if (rangeInput?.startDate) {
      dateTimeFilter.gte = new Date(rangeInput.startDate); // gte条件を設定
      hasDateTimeFilterConditions = true;
    }
    if (rangeInput?.endDate) {
      dateTimeFilter.lte = new Date(rangeInput.endDate); // lte条件を設定
      hasDateTimeFilterConditions = true;
    }

    // 日付条件が何か一つでも設定されていれば、where句に追加
    if (hasDateTimeFilterConditions) {
      where.datetime = dateTimeFilter;
    }

    if (rangeInput?.searchTerm) {
      where.description = { contains: rangeInput.searchTerm };
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
        create: lines.map((line) => ({
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
      },
    });
  }
}
