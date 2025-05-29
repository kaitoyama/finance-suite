# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack finance suite application for accounting and expense management, built as a monorepo with:
- **API**: NestJS GraphQL backend with Prisma ORM
- **Web**: Next.js frontend with URQL GraphQL client
- **Database**: MariaDB for data persistence
- **Storage**: MinIO for file attachments

## Development Commands

### API (Backend)
```bash
cd api/
pnpm install           # Install dependencies
pnpm start:dev         # Start development server with hot reload
pnpm build             # Build for production
pnpm test              # Run unit tests
pnpm test:e2e          # Run end-to-end tests
pnpm lint              # Run ESLint
pnpm prisma migrate dev # Run database migrations
pnpm prisma migrate dev --name migration_name # Create new migration
```

### Web (Frontend)
```bash
cd web/
pnpm install           # Install dependencies
pnpm dev               # Start development server
pnpm build             # Build for production
pnpm lint              # Run Next.js linting
pnpm codegen           # Generate GraphQL types from schema
pnpm codegen:watch     # Watch mode for GraphQL codegen
```

### Infrastructure
```bash
docker-compose up -d   # Start MariaDB database
```

## Architecture

### Database Schema
Core entities follow double-entry accounting principles:
- **Account**: Chart of accounts with 5 categories (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
- **JournalEntry/JournalLine**: Double-entry bookkeeping transactions
- **Invoice**: Customer invoicing with PDF generation
- **Payment**: Payment tracking with multiple attachment support
- **ExpenseRequest**: Employee expense workflow with state machine (DRAFT → PENDING → APPROVED → PAID)
- **Budget**: Annual budget planning by account
- **Attachment**: File storage metadata for receipts/documents

### API Architecture
- **GraphQL API**: Schema-first approach with auto-generated schema.gql
- **Modules**: Domain-driven modules (accounts, invoices, payments, expenses, etc.)
- **Authentication**: User header middleware for user context
- **PDF Generation**: Puppeteer-based invoice PDF creation with Handlebars templates
- **File Storage**: MinIO integration for attachment handling
- **Database Connection**: Dynamic DATABASE_URL construction from individual environment variables

### Frontend Architecture
- **App Router**: Next.js 15 with file-based routing
- **State Management**: URQL for GraphQL state + React Hook Form for forms
- **UI Components**: Radix UI + Tailwind CSS via shadcn/ui
- **Type Safety**: GraphQL Code Generator for type-safe API operations

## Key Development Patterns

### GraphQL Operations
- Run `pnpm codegen` in web/ after schema changes
- Use generated hooks from `src/hooks/` for data fetching
- Place GraphQL operations in component files, codegen extracts them automatically

### Database Changes
- Create migrations with descriptive names: `pnpm prisma migrate dev --name add_feature_name`
- Update schema.prisma first, then generate migration
- Seed data available in `api/prisma/seed.ts`

### File Uploads
- Use AttachmentUploader component for file handling
- Files stored in MinIO with metadata in Attachment table
- Support for multiple attachments per payment via PaymentAttachment join table

### Business Logic
- ExpenseRequest uses XState for workflow state management
- Journal entries must balance (debits = credits) via validation pipes
- Invoice status automatically updated based on payment amounts

## Environment Setup

### Required Environment Variables
API (.env):
```
# MariaDB Database Configuration (New Method)
NS_MARIADB_HOST=localhost
NS_MARIADB_PORT=3306
NS_MARIADB_DATABASE=finance
NS_MARIADB_USER=app
NS_MARIADB_PASSWORD=appsecret

# Legacy DATABASE_URL (still supported for backward compatibility)
# DATABASE_URL="mysql://app:appsecret@localhost:3306/finance"

# Other Configuration
FRONTEND_URL="http://localhost:3001"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

### Database Connection
The application now supports two methods for database configuration:
1. **Individual Environment Variables** (Recommended): Use `NS_MARIADB_*` variables for flexible configuration
2. **Legacy DATABASE_URL**: Still supported for backward compatibility

The `DatabaseConfigService` automatically constructs the connection URL from individual variables with sensible defaults.

### Default Ports
- API: http://localhost:3000
- Web: http://localhost:3001  
- Database: localhost:3306
- GraphQL Playground: http://localhost:3000/graphql

### User Authentication
- Simple header-based user identification via X-USER-ID
- Users created manually in database or via seed
- Admin users have additional permissions for approvals