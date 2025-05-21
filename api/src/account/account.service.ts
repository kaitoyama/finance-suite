import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAccountInput } from './dto/create-account.input';
import { Account, AccountCategory } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async create(createAccountInput: CreateAccountInput): Promise<Account> {
    return this.prisma.account.create({
      data: createAccountInput,
    });
  }

  async findAll(): Promise<Account[]> {
    return this.prisma.account.findMany();
  }

  async findOne(id: number): Promise<Account | null> {
    return this.prisma.account.findUnique({ where: { id } });
  }

  // Update and remove methods can be added here later if needed
} 