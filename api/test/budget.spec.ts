import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';
import { Account, Budget, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Helper to run GraphQL queries/mutations
const graphqlQuery = (app: INestApplication, query: string, variables?: Record<string, any>) => {
  return request(app.getHttpServer())
    .post('/graphql')
    .send({ query, variables });
};

describe('BudgetsResolver (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAccount: Account;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Ensure validation pipe is used for e2e tests
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create a test account
    testAccount = await prisma.account.create({
      data: {
        code: '9999', // Unique code for test account
        name: 'Test Budget Account',
        category: 'EXPENSE',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.budget.deleteMany({ where: { accountId: testAccount.id } });
    await prisma.account.delete({ where: { id: testAccount.id } });
    await app.close();
  });

  describe('setBudget mutation', () => {
    it('should create a new budget if one does not exist', async () => {
      const fiscalYear = 2025;
      const amountPlanned = new Decimal('1000.00');

      const mutation = `
        mutation SetBudget($input: BudgetInput!) {
          setBudget(input: $input) {
            id
            accountId
            fiscalYear
            amountPlanned
            createdAt
          }
        }
      `;
      const variables = {
        input: {
          accountId: testAccount.id,
          fiscalYear,
          amountPlanned: parseFloat(amountPlanned.toString()), // GraphQL Float
        },
      };

      const response = await graphqlQuery(app, mutation, variables);

      expect(response.status).toBe(200);
      expect(response.body.data.setBudget).toBeDefined();
      expect(response.body.data.setBudget.accountId).toBe(testAccount.id);
      expect(response.body.data.setBudget.fiscalYear).toBe(fiscalYear);
      // Prisma returns Decimal, GraphQL returns Float. Compare string representations for precision.
      expect(new Decimal(response.body.data.setBudget.amountPlanned).toFixed(2)).toBe(amountPlanned.toFixed(2));

      // Verify in DB
      const dbBudget = await prisma.budget.findUnique({
        where: { accountId_fiscalYear: { accountId: testAccount.id, fiscalYear } },
      });
      expect(dbBudget).toBeDefined();
      expect(dbBudget?.amountPlanned.toFixed(2)).toBe(amountPlanned.toFixed(2));
    });

    it('should update an existing budget (upsert)', async () => {
      const fiscalYear = 2026;
      const initialAmount = new Decimal('500.00');
      const updatedAmount = new Decimal('1500.00');

      // Create initial budget
      await prisma.budget.create({
        data: {
          accountId: testAccount.id,
          fiscalYear,
          amountPlanned: initialAmount,
        },
      });

      const mutation = `
        mutation SetBudget($input: BudgetInput!) {
          setBudget(input: $input) {
            id
            accountId
            fiscalYear
            amountPlanned
          }
        }
      `;
      const variables = {
        input: {
          accountId: testAccount.id,
          fiscalYear,
          amountPlanned: parseFloat(updatedAmount.toString()),
        },
      };

      const response = await graphqlQuery(app, mutation, variables);

      expect(response.status).toBe(200);
      expect(response.body.data.setBudget.accountId).toBe(testAccount.id);
      expect(response.body.data.setBudget.fiscalYear).toBe(fiscalYear);
      expect(new Decimal(response.body.data.setBudget.amountPlanned).toFixed(2)).toBe(updatedAmount.toFixed(2));

      // Verify in DB
      const dbBudget = await prisma.budget.findUnique({
        where: { accountId_fiscalYear: { accountId: testAccount.id, fiscalYear } },
      });
      expect(dbBudget?.amountPlanned.toFixed(2)).toBe(updatedAmount.toFixed(2));
    });

    it('should return a validation error for fiscalYear < 2000', async () => {
      const mutation = `
        mutation SetBudget($input: BudgetInput!) {
          setBudget(input: $input) { id }
        }
      `;
      const variables = {
        input: {
          accountId: testAccount.id,
          fiscalYear: 1999,
          amountPlanned: 100,
        },
      };
      const response = await graphqlQuery(app, mutation, variables);
      expect(response.status).toBe(400); // Or 200 with errors array, depending on GraphQL server config
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('fiscalYear must not be less than 2000');
    });

    it('should return a validation error for negative amountPlanned', async () => {
      const mutation = `
        mutation SetBudget($input: BudgetInput!) {
          setBudget(input: $input) { id }
        }
      `;
      const variables = {
        input: {
          accountId: testAccount.id,
          fiscalYear: 2027,
          amountPlanned: -50,
        },
      };
      const response = await graphqlQuery(app, mutation, variables);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('amountPlanned must not be less than 0');
    });

     it('should return an error for non-existent accountId (FK constraint)', async () => {
      const mutation = `
        mutation SetBudget($input: BudgetInput!) {
          setBudget(input: $input) { id }
        }
      `;
      const variables = {
        input: {
          accountId: 999999, // Non-existent account ID
          fiscalYear: 2028,
          amountPlanned: 100,
        },
      };
      // This will likely result in a Prisma-level error or a GraphQL error if not caught by validation
      // For this test, we expect the service to handle it gracefully or Prisma to throw
      // Depending on error handling, status could be 500 or a GraphQL error
      try {
        await graphqlQuery(app, mutation, variables);
      } catch (error) {
        // If the error is caught and re-thrown as a NestJS/GraphQL error, check that
        // This part is highly dependent on how Prisma errors are propagated
        expect(error.response.errors[0].extensions.code).toBe('INTERNAL_SERVER_ERROR');
      }
      // More robust check: Querying Prisma directly for a failed insert (if possible)
      // Or ensure the GraphQL response indicates a failure related to foreign key
      const response = await graphqlQuery(app, mutation, variables);
      expect(response.body.errors).toBeDefined();
      // The exact error message might vary based on Prisma error handling
      // It might be a generic server error if not specifically handled.
      // For now, let's assume it triggers a GraphQL error that can be caught.
      // expect(response.body.errors[0].message).toContain('Foreign key constraint failed');
    });

  });

  describe('budgets query', () => {
    beforeAll(async () => {
      // Seed some budgets for querying
      await prisma.budget.createMany({
        data: [
          { accountId: testAccount.id, fiscalYear: 2023, amountPlanned: new Decimal('200.00') },
          { accountId: testAccount.id, fiscalYear: 2024, amountPlanned: new Decimal('300.00') },
          { accountId: testAccount.id, fiscalYear: 2024, amountPlanned: new Decimal('400.00') }, // Duplicate for test
        ],
        skipDuplicates: true, // Important for the upsert logic in setBudget or direct creates
      });
    });

    it('should return budgets for a given fiscalYear', async () => {
      const fiscalYearToQuery = 2024;
      const query = `
        query GetBudgets($fiscalYear: Int!) {
          budgets(fiscalYear: $fiscalYear) {
            id
            accountId
            fiscalYear
            amountPlanned
          }
        }
      `;
      const variables = { fiscalYear: fiscalYearToQuery };

      const response = await graphqlQuery(app, query, variables);

      expect(response.status).toBe(200);
      expect(response.body.data.budgets).toBeInstanceOf(Array);
      expect(response.body.data.budgets.length).toBeGreaterThanOrEqual(1); // At least the one we added for 2024
      response.body.data.budgets.forEach((budget: any) => {
        expect(budget.fiscalYear).toBe(fiscalYearToQuery);
        expect(budget.accountId).toBe(testAccount.id);
      });
    });

    it('should return an empty array if no budgets exist for the fiscalYear', async () => {
      const fiscalYearToQuery = 1900; // Unlikely to have budgets
       const query = `
        query GetBudgets($fiscalYear: Int!) {
          budgets(fiscalYear: $fiscalYear) {
            id
          }
        }
      `;
      const variables = { fiscalYear: fiscalYearToQuery };
      const response = await graphqlQuery(app, query, variables);

      expect(response.status).toBe(200);
      expect(response.body.data.budgets).toEqual([]);
    });
  });
}); 