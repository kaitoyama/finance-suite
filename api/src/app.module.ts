import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { VouchersModule } from './vouchers/vouchers.module';
import { GlobalConfigModule } from './config/config.module';
import { UserHeaderMiddleware } from './common/middleware/user-header.middleware';
import { UsersModule } from './users/users.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { MinioModule } from './storage/minio.module';
import { PrismaModule } from './prisma.module';
import { JournalModule } from './journal/journal.module';

@Module({
  imports: [
    GlobalConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      playground: true,
    }),
    VouchersModule,
    UsersModule,
    AttachmentsModule,
    MinioModule,
    PrismaModule,
    JournalModule,
  ],
  providers: [AppResolver],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserHeaderMiddleware)
      .forRoutes('*'); // GraphQL も REST も全部通す
  }
}
