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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
