import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountResolver } from './account.resolver';
import { AccountBootstrapService } from './account-bootstrap.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AccountResolver, AccountService, AccountBootstrapService],
  exports: [AccountBootstrapService], // Export for other modules if needed
})
export class AccountModule {}
