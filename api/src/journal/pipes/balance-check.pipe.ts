import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateJournalEntryInput } from '../dto/create-journal-entry.input';
import { UpdateJournalEntryInput } from '../dto/update-journal-entry.input';
import { BusinessRuleException } from '../../common/exceptions/business-rule.exception';

@Injectable()
export class BalanceCheckPipe implements PipeTransform {
  transform(
    value: CreateJournalEntryInput | UpdateJournalEntryInput,
    _metadata: ArgumentMetadata,
  ) {
    if (!value.lines || value.lines.length === 0) {
      return value;
    }

    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const line of value.lines) {
      totalDebit = totalDebit.add(new Decimal(line.debit || 0));
      totalCredit = totalCredit.add(new Decimal(line.credit || 0));
    }

    if (!totalDebit.equals(totalCredit)) {
      throw new BusinessRuleException(
        'Debit and credit totals do not match.',
        BusinessRuleException.DEBIT_CREDIT_MISMATCH,
      );
    }

    return value;
  }
}
