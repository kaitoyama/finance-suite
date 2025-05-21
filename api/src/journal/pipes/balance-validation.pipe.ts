import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { CreateJournalEntryInput } from '../dto/create-journal-entry.input';
import { UpdateJournalEntryInput } from '../dto/update-journal-entry.input';

@Injectable()
export class BalanceValidationPipe implements PipeTransform {
  transform(value: CreateJournalEntryInput | UpdateJournalEntryInput, metadata: ArgumentMetadata) {
    if (!value.lines || value.lines.length === 0) {
      // Allow if there are no lines or lines are not provided (e.g., partial update without line changes)
      // Or, if business rule dictates lines must exist, throw error here.
      // For now, assume it's valid if lines are not being modified or are empty.
      return value;
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of value.lines) {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    }

    // Using a small epsilon for float comparison might be safer, but direct comparison is often acceptable for currency.
    if (Math.abs(totalDebit - totalCredit) > 0.001) { // Allowing for small floating point discrepancies
      throw new BadRequestException('Debit/Credit amounts not balanced.');
    }

    return value;
  }
}
