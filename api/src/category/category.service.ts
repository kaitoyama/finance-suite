import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryInput: CreateCategoryInput): Promise<Category> {
    try {
      return await this.prisma.category.create({
        data: createCategoryInput,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('カテゴリ名が既に存在します。');
      }
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`ID ${id} のカテゴリが見つかりません。`);
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: updateCategoryInput.name,
          description: updateCategoryInput.description,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('カテゴリ名が既に存在します。');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`ID ${id} のカテゴリが見つかりません。`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Category> {
    // カテゴリが使用されているかチェック
    const budgetCount = await this.prisma.budget.count({
      where: { categoryId: id },
    });

    const expenseCount = await this.prisma.expenseRequest.count({
      where: { categoryId: id },
    });

    if (budgetCount > 0 || expenseCount > 0) {
      throw new BadRequestException(
        'このカテゴリは予算または経費で使用されているため削除できません。',
      );
    }

    try {
      return await this.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`ID ${id} のカテゴリが見つかりません。`);
      }
      throw error;
    }
  }
}
