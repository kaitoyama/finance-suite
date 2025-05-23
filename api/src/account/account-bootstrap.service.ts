import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AccountCategory } from '@prisma/client';

interface RequiredAccount {
  code: string;
  name: string;
  category: AccountCategory;
}

@Injectable()
export class AccountBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AccountBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureRequiredAccountsExist();
  }

  private async ensureRequiredAccountsExist(): Promise<void> {
    // 自動仕訳に必要な最低限のアカウント
    const requiredAccounts: RequiredAccount[] = [
      { code: '101', name: '現金', category: 'ASSET' },
      { code: '102', name: '普通預金', category: 'ASSET' },
      { code: '120', name: '売掛金', category: 'ASSET' },
      { code: '401', name: '売上高', category: 'REVENUE' },
      { code: '501', name: '仕入高', category: 'EXPENSE' },
    ];

    this.logger.log('Checking required accounts...');

    for (const requiredAccount of requiredAccounts) {
      try {
        const existingAccount = await this.prisma.account.findUnique({
          where: { code: requiredAccount.code },
        });

        if (!existingAccount) {
          const createdAccount = await this.prisma.account.create({
            data: requiredAccount,
          });
          this.logger.log(
            `Created missing account: ${createdAccount.code} - ${createdAccount.name}`,
          );
        } else {
          this.logger.debug(
            `Account already exists: ${existingAccount.code} - ${existingAccount.name}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to ensure account ${requiredAccount.code} exists:`,
          error,
        );
        // Continue with other accounts even if one fails
      }
    }

    this.logger.log('Required accounts check completed');
  }

  /**
   * Get all required account codes for validation purposes
   */
  getRequiredAccountCodes(): string[] {
    return ['101', '102', '120', '401', '501'];
  }
}