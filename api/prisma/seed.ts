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
    // 資産
    { code: '101', name: '現金',       category: 'ASSET'    },
    { code: '102', name: '普通預金',   category: 'ASSET'    },
    { code: '120', name: '売掛金',     category: 'ASSET'    },
    // 負債
    { code: '201', name: '買掛金',     category: 'LIABILITY'},
    // 純資産
    { code: '301', name: '資本金',     category: 'EQUITY'   },
    // 収益
    { code: '401', name: '売上高',     category: 'REVENUE'  },
    // 費用
    { code: '501', name: '仕入高',     category: 'EXPENSE'  },
    { code: '511', name: '給料賃金',   category: 'EXPENSE'  },
    { code: '521', name: '支払家賃',   category: 'EXPENSE'  },
    { code: '531', name: '通信費',     category: 'EXPENSE'  },
  ];

  await prisma.account.createMany({ data: accounts, skipDuplicates: true });

  // --- 3. Initial Categories --------------------------------------------
  const categories: Prisma.CategoryCreateManyInput[] = [
    { name: '事務用品', description: '文房具、事務機器など' },
    { name: '交通費', description: '出張、移動にかかる費用' },
    { name: '接待交際費', description: '会議、懇親会などの費用' },
    { name: '研修費', description: '社員研修、セミナー参加費' },
    { name: '広告宣伝費', description: 'マーケティング、広告にかかる費用' },
    { name: '消耗品費', description: '短期間で消費される物品' },
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
