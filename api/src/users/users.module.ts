import { Module } from '@nestjs/common';
import { MeResolver } from './me/me.resolver';
import { PrismaModule } from '../prisma.module'; // Correct path

@Module({
  imports: [PrismaModule], // Add PrismaModule
  providers: [MeResolver],
  // exports: [UserService] // if you create and want to use UserService elsewhere
})
export class UsersModule {}
