import { Module } from '@nestjs/common';
import { MeResolver } from './me/me.resolver';

@Module({
  providers: [MeResolver]
})
export class UsersModule {}
