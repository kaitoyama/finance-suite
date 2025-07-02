/**
 * Seed script for a minimal bookkeeping stack.
 * Run with:  pnpm prisma db seed
 * (Be sure .env contains DATABASE_URL)
 */
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- 1. Admin / normal users ------------------------------------------
  await prisma.user.createMany({
    data: [
      { username: 'alice',  isAdmin: true  },
      { username: 'bob',    isAdmin: true  },
      { username: 'carol',  isAdmin: false },
    ],
    skipDuplicates: true,      // safe to rerun
  });

  // --- 2. Chart of Accounts ---------------------------------------------
  const accounts: Prisma.AccountCreateManyInput[] = [
    // 資産（お金の管理）
    { code: '101', name: '現金',       category: 'ASSET'    },  // 現金で支払ったお金
    { code: '102', name: '普通預金',   category: 'ASSET'    },  // 口座にあるお金、振込
    
    // 収益
    { code: '401', name: '協賛金',     category: 'REVENUE'  },  // 請求書による協賛金収入
    
    // 費用
    { code: '501', name: '一般経費',   category: 'EXPENSE'  },  // すべての経費
  ];

  await prisma.account.createMany({ data: accounts, skipDuplicates: true });

  // --- 3. Initial Categories --------------------------------------------
  const categories: Prisma.CategoryCreateManyInput[] = [
    { name: '一般経費', description: '事務用品、消耗品、その他一般的な経費' },
    { name: '交通費', description: '出張、移動にかかる費用' },
    { name: '会議・懇親費', description: '会議、懇親会、研修などの費用' },
  ];

  await prisma.category.createMany({ data: categories, skipDuplicates: true });

  // --- 4. Initial Budgets (for current fiscal year) ---------------------
  const currentFiscalYear = parseInt(process.env.FISCAL_YEAR || new Date().getFullYear().toString());
  const allCategories = await prisma.category.findMany({ select: { id: true } });

  const budgetsToCreate: Prisma.BudgetCreateManyInput[] = allCategories.map(cat => ({
    categoryId: cat.id,
    fiscalYear: currentFiscalYear,
    amountPlanned: 0, // Default to 0 as per AC5
  }));

  if (budgetsToCreate.length > 0) {
    await prisma.budget.createMany({
      data: budgetsToCreate,
      skipDuplicates: true, // Avoid errors if already seeded
    });
    console.log(`Seeded ${budgetsToCreate.length} empty budgets for fiscal year ${currentFiscalYear}.`);
  } else {
    console.log('No accounts found to seed budgets for.');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
