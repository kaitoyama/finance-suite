import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from './entities/user.entity'; // Assuming User entity is here
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findOrCreateByUsername(
    username: string,
    isAdmin: boolean = false,
  ): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return existingUser;
    }

    // User does not exist, create them
    return this.prisma.user.create({
      data: {
        username,
        isAdmin,
      },
    });
  }

  // Potentially other user-related methods like create, findAll, findOne, update, remove
}
