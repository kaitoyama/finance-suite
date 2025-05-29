import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseResolver } from './expense.resolver';
import { WebhookService } from '../common/services/webhook.service';
import { ConfigService } from '@nestjs/config';
import { PubSub } from 'graphql-subscriptions';
// Import Resolver and other necessary providers here later

@Module({
  providers: [
    ExpenseService,
    ExpenseResolver,
    WebhookService,
    ConfigService,
    {
      provide: 'PUB_SUB',
      useFactory: () => {
        return new PubSub();
      },
    },
  ],
  exports: [ExpenseService],
})
export class ExpenseModule {}
