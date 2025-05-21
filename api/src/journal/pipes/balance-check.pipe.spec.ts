import { BalanceCheckPipe } from './balance-check.pipe';
import { BusinessRuleException } from '../../common/exceptions/business-rule.exception';
import { Decimal } from '@prisma/client/runtime/library';
import { ArgumentMetadata } from '@nestjs/common';
import { CreateJournalEntryInput } from '../dto/create-journal-entry.input';
import { UpdateJournalEntryInput } from '../dto/update-journal-entry.input';

// Mock DTOs
const mockCreateJournalEntryInput = (lines: any[]): CreateJournalEntryInput => ({
  date: new Date(),
  description: 'Test Entry',
  lines,
  posted: false, // Add missing property
  reference: '', // Add missing property
});

const mockUpdateJournalEntryInput = (id: number, lines: any[]): UpdateJournalEntryInput => ({
  id,
  date: new Date(),
  description: 'Test Update Entry',
  lines,
  posted: false, // Add missing property
  reference: '', // Add missing property
});


describe('BalanceCheckPipe', () => {
  let pipe: BalanceCheckPipe;
  const metadata: ArgumentMetadata = { type: 'body' };

  beforeEach(() => {
    pipe = new BalanceCheckPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('Balanced Input', () => {
    it('should return the input value when debits and credits are balanced', () => {
      const value = mockCreateJournalEntryInput([
        { accountId: 1, debit: new Decimal(100), credit: new Decimal(0) },
        { accountId: 2, debit: new Decimal(0), credit: new Decimal(100) },
      ]);
      expect(pipe.transform(value, metadata)).toEqual(value);
    });
  });

  describe('Debits Exceed Credits', () => {
    it('should throw BusinessRuleException when debits exceed credits', () => {
      const value = mockCreateJournalEntryInput([
        { accountId: 1, debit: new Decimal(150), credit: new Decimal(0) },
        { accountId: 2, debit: new Decimal(0), credit: new Decimal(100) },
      ]);
      try {
        pipe.transform(value, metadata);
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessRuleException);
        expect(error.message).toBe("Debit and credit totals do not match.");
        expect(error.code).toBe(BusinessRuleException.DEBIT_CREDIT_MISMATCH);
      }
    });
  });

  describe('Credits Exceed Debits', () => {
    it('should throw BusinessRuleException when credits exceed debits', () => {
      const value = mockCreateJournalEntryInput([
        { accountId: 1, debit: new Decimal(100), credit: new Decimal(0) },
        { accountId: 2, debit: new Decimal(0), credit: new Decimal(150) },
      ]);
      expect(() => pipe.transform(value, metadata)).toThrow(
        new BusinessRuleException(
          "Debit and credit totals do not match.",
          BusinessRuleException.DEBIT_CREDIT_MISMATCH
        )
      );
    });
  });

  describe('Empty Lines Array', () => {
    it('should return the input value when lines array is empty', () => {
      const value = mockCreateJournalEntryInput([]);
      expect(pipe.transform(value, metadata)).toEqual(value);
    });
  });

  describe('Null Lines', () => {
    it('should return the input value when lines is null', () => {
      const value = mockCreateJournalEntryInput(null);
      expect(pipe.transform(value, metadata)).toEqual(value);
    });
  });

  describe('Undefined Lines', () => {
    it('should return the input value when lines is undefined', () => {
      const value = mockCreateJournalEntryInput(undefined);
      expect(pipe.transform(value, metadata)).toEqual(value);
    });
  });

  describe('Lines with zero amounts', () => {
    it('should return the input value when lines have zero amounts', () => {
      const value = mockCreateJournalEntryInput([
        { accountId: 1, debit: new Decimal(0), credit: new Decimal(0) },
      ]);
      expect(pipe.transform(value, metadata)).toEqual(value);
    });
  });

  describe('Lines with mixed null/undefined and zero amounts', () => {
    it('should return the input value for mixed valid lines', () => {
      const valueForCreate = mockCreateJournalEntryInput([
        { accountId: 1, debit: new Decimal(10), credit: null },
        { accountId: 2, debit: undefined, credit: new Decimal(10) },
      ]);
      expect(pipe.transform(valueForCreate, metadata)).toEqual(valueForCreate);

      const valueForUpdate = mockUpdateJournalEntryInput(1, [
        { lineId: 1, accountId: 1, debit: new Decimal(20), credit: null },
        { lineId: 2, accountId: 2, debit: undefined, credit: new Decimal(20) },
      ]);
      expect(pipe.transform(valueForUpdate, metadata)).toEqual(valueForUpdate);
    });
  });
});
