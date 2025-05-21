import { Module } from '@nestjs/common';
import { MeResolver } from './me/me.resolver';
import { PrismaModule } from '../prisma.module'; // Correct path
import { UserService } from './user.service';
// If you have a UsersResolver, import it here
// import { UsersResolver } from './users.resolver';

@Module({
  imports: [PrismaModule], // Add PrismaModule
  providers: [
    MeResolver,
    UserService,
    // UsersResolver, // Add UsersResolver here if it exists
  ],
  exports: [UserService], // Export UserService so other modules can import it
  // exports: [UserService] // if you create and want to use UserService elsewhere
})
export class UsersModule {}
