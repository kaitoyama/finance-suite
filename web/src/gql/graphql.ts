import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type Account = {
  __typename?: 'Account';
  category: AccountCategory;
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type AccountCategory =
  | 'ASSET'
  | 'EQUITY'
  | 'EXPENSE'
  | 'LIABILITY'
  | 'REVENUE';

export type AccountSummary = {
  __typename?: 'AccountSummary';
  accountCode: Scalars['String']['output'];
  accountId: Scalars['Float']['output'];
  accountName: Scalars['String']['output'];
  balance: Scalars['Float']['output'];
};

export type Attachment = {
  __typename?: 'Attachment';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  s3Key: Scalars['String']['output'];
  title: Scalars['String']['output'];
  uploader: User;
  uploaderId: Scalars['Int']['output'];
};

export type BudgetBalance = {
  __typename?: 'BudgetBalance';
  actual: Scalars['Float']['output'];
  categoryDescription?: Maybe<Scalars['String']['output']>;
  categoryId: Scalars['Int']['output'];
  categoryName: Scalars['String']['output'];
  planned: Scalars['Float']['output'];
  /** Consumption ratio 0.00–1.00 */
  ratio: Scalars['Float']['output'];
  remaining: Scalars['Float']['output'];
};

export type BudgetDto = {
  __typename?: 'BudgetDto';
  amountPlanned: Scalars['Float']['output'];
  categoryId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  fiscalYear: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
};

export type BudgetInput = {
  amountPlanned: Scalars['Float']['input'];
  categoryId: Scalars['Int']['input'];
  fiscalYear: Scalars['Int']['input'];
};

export type Category = {
  __typename?: 'Category';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateAccountInput = {
  category: AccountCategory;
  code: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateAttachmentInput = {
  amount: Scalars['Float']['input'];
  s3Key: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateCategoryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateExpenseRequestInput = {
  accountId?: InputMaybe<Scalars['Int']['input']>;
  amount: Scalars['Float']['input'];
  attachmentId: Scalars['Int']['input'];
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type CreateJournalEntryInput = {
  datetime?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  lines: Array<JournalLineInput>;
};

export type CreatePaymentInput = {
  /** Amount of the payment */
  amount: Scalars['Float']['input'];
  /** IDs of attachments to link to this payment */
  attachmentIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Direction of the payment (IN/OUT) */
  direction: PaymentDirection;
  /** ID of the expense request to associate this payment with */
  expenseRequestId?: InputMaybe<Scalars['Int']['input']>;
  /** ID of the invoice to associate this payment with */
  invoiceId?: InputMaybe<Scalars['Int']['input']>;
  /** Method of the payment (BANK/CASH/OTHER) */
  method: PaymentMethod;
  /** Date when the payment was made */
  paidAt: Scalars['DateTime']['input'];
};

export type CreateVoucherInput = {
  /** Example field (placeholder) */
  exampleField: Scalars['Int']['input'];
};

export type ExpenseRequest = {
  __typename?: 'ExpenseRequest';
  account?: Maybe<Account>;
  amount: Scalars['Float']['output'];
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  approver?: Maybe<User>;
  attachment: Attachment;
  category?: Maybe<Category>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  payment?: Maybe<Payment>;
  requester: User;
  state: RequestState;
};

export type GenerateInvoicePdfInput = {
  amount: Scalars['Float']['input'];
  date: Scalars['String']['input'];
  dueDateText: Scalars['String']['input'];
  invoiceNo: Scalars['String']['input'];
  itemDescriptionText?: InputMaybe<Scalars['String']['input']>;
  partnerName: Scalars['String']['input'];
  subjectText?: InputMaybe<Scalars['String']['input']>;
};

export type GenerateInvoicePdfPayload = {
  __typename?: 'GenerateInvoicePdfPayload';
  pdfKey: Scalars['String']['output'];
  presignedUrl: Scalars['String']['output'];
};

export type Invoice = {
  __typename?: 'Invoice';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dueDate: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  invoiceNo: Scalars['String']['output'];
  partnerName: Scalars['String']['output'];
  pdfKey: Scalars['String']['output'];
  status: InvoiceStatus;
};

export type InvoiceInput = {
  amount: Scalars['Float']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate: Scalars['String']['input'];
  partnerName: Scalars['String']['input'];
};

export type InvoiceStatus =
  | 'DRAFT'
  | 'OVERPAY'
  | 'PAID'
  | 'PARTIAL'
  | 'UNPAID';

export type JournalEntry = {
  __typename?: 'JournalEntry';
  createdBy?: Maybe<User>;
  createdById: Scalars['Int']['output'];
  datetime: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lines?: Maybe<Array<Maybe<JournalLine>>>;
};

export type JournalLine = {
  __typename?: 'JournalLine';
  account?: Maybe<Account>;
  accountId: Scalars['Int']['output'];
  credit?: Maybe<Scalars['Float']['output']>;
  debit?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
};

export type JournalLineInput = {
  accountId: Scalars['Int']['input'];
  credit?: InputMaybe<Scalars['Float']['input']>;
  debit?: InputMaybe<Scalars['Float']['input']>;
};

export type MarkExpensePaidInput = {
  expenseRequestId: Scalars['Int']['input'];
  paymentId: Scalars['Int']['input'];
};

export type MeDto = {
  __typename?: 'MeDto';
  isAdmin: Scalars['Boolean']['output'];
  username: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  approveExpenseRequest: ExpenseRequest;
  closeExpenseRequest: ExpenseRequest;
  createAccount: Account;
  createAttachment: Attachment;
  createCategory: Category;
  createInvoice: Invoice;
  createJournalEntry: JournalEntry;
  createPayment: Payment;
  createPresignedPost: PresignedPayload;
  createVoucher: Voucher;
  generateInvoicePdf: GenerateInvoicePdfPayload;
  markExpensePaid: ExpenseRequest;
  rejectExpenseRequest: ExpenseRequest;
  removeCategory: Category;
  removeJournalEntry?: Maybe<JournalEntry>;
  removePayment: Payment;
  removeVoucher: Voucher;
  resubmitExpenseRequest: ExpenseRequest;
  setBudget: BudgetDto;
  submitExpenseRequest: ExpenseRequest;
  updateCategory: Category;
  updateExpenseRequest: ExpenseRequest;
  updateJournalEntry: JournalEntry;
  updatePayment: Payment;
  updateVoucher: Voucher;
};


export type MutationApproveExpenseRequestArgs = {
  id: Scalars['Int']['input'];
};


export type MutationCloseExpenseRequestArgs = {
  id: Scalars['Int']['input'];
};


export type MutationCreateAccountArgs = {
  createAccountInput: CreateAccountInput;
};


export type MutationCreateAttachmentArgs = {
  input: CreateAttachmentInput;
};


export type MutationCreateCategoryArgs = {
  createCategoryInput: CreateCategoryInput;
};


export type MutationCreateInvoiceArgs = {
  input: InvoiceInput;
};


export type MutationCreateJournalEntryArgs = {
  createJournalEntryInput: CreateJournalEntryInput;
};


export type MutationCreatePaymentArgs = {
  createPaymentInput: CreatePaymentInput;
};


export type MutationCreatePresignedPostArgs = {
  filename: Scalars['String']['input'];
};


export type MutationCreateVoucherArgs = {
  createVoucherInput: CreateVoucherInput;
};


export type MutationGenerateInvoicePdfArgs = {
  input: GenerateInvoicePdfInput;
};


export type MutationMarkExpensePaidArgs = {
  input: MarkExpensePaidInput;
};


export type MutationRejectExpenseRequestArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveCategoryArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveJournalEntryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemovePaymentArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveVoucherArgs = {
  id: Scalars['Int']['input'];
};


export type MutationResubmitExpenseRequestArgs = {
  id: Scalars['Int']['input'];
};


export type MutationSetBudgetArgs = {
  input: BudgetInput;
};


export type MutationSubmitExpenseRequestArgs = {
  input: CreateExpenseRequestInput;
};


export type MutationUpdateCategoryArgs = {
  updateCategoryInput: UpdateCategoryInput;
};


export type MutationUpdateExpenseRequestArgs = {
  input: UpdateExpenseRequestInput;
};


export type MutationUpdateJournalEntryArgs = {
  updateJournalEntryInput: UpdateJournalEntryInput;
};


export type MutationUpdatePaymentArgs = {
  id: Scalars['Int']['input'];
  updatePaymentInput: UpdatePaymentInput;
};


export type MutationUpdateVoucherArgs = {
  updateVoucherInput: UpdateVoucherInput;
};

export type PaginatedExpenseRequestResponse = {
  __typename?: 'PaginatedExpenseRequestResponse';
  items: Array<ExpenseRequest>;
  pagination: PaginationInfo;
};

export type PaginationInfo = {
  __typename?: 'PaginationInfo';
  currentPage: Scalars['Int']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Float']['output'];
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  direction: PaymentDirection;
  expenseRequestId?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  invoice?: Maybe<Invoice>;
  invoiceId?: Maybe<Scalars['Int']['output']>;
  label: PaymentLabel;
  method: PaymentMethod;
  overpaidAmount?: Maybe<Scalars['Float']['output']>;
  paidAt: Scalars['DateTime']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** Direction of the payment (IN/OUT) */
export type PaymentDirection =
  | 'IN'
  | 'OUT';

export type PaymentLabel =
  | 'NORMAL'
  | 'OVERPAY'
  | 'PARTIAL';

/** Method of the payment (BANK/CASH/OTHER) */
export type PaymentMethod =
  | 'BANK'
  | 'CASH'
  | 'OTHER';

export type PresignedPayload = {
  __typename?: 'PresignedPayload';
  fields: Array<PresignedPayloadField>;
  objectKey: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type PresignedPayloadField = {
  __typename?: 'PresignedPayloadField';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type ProfitLossStatement = {
  __typename?: 'ProfitLossStatement';
  endDate: Scalars['String']['output'];
  expenses: Array<AccountSummary>;
  fiscalYear: Scalars['Float']['output'];
  netIncome: Scalars['Float']['output'];
  revenues: Array<AccountSummary>;
  startDate: Scalars['String']['output'];
  totalExpense: Scalars['Float']['output'];
  totalRevenue: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accounts: Array<Account>;
  budgets: Array<BudgetBalance>;
  categories: Array<Category>;
  category: Category;
  expenseRequest?: Maybe<ExpenseRequest>;
  expenseRequests?: Maybe<Array<ExpenseRequest>>;
  expenseRequestsPaginated: PaginatedExpenseRequestResponse;
  getPresignedS3Url: PresignedPayload;
  /** Health-check */
  hello: Scalars['String']['output'];
  invoice: Invoice;
  invoices: Array<Invoice>;
  journalEntries: Array<JournalEntry>;
  journalEntry?: Maybe<JournalEntry>;
  listBudgetsByYear: Array<BudgetDto>;
  /** 現在のユーザーを返す */
  me: MeDto;
  payment?: Maybe<Payment>;
  payments: Array<Payment>;
  profitLossStatement: ProfitLossStatement;
  voucher: Voucher;
  vouchers: Array<Voucher>;
};


export type QueryAccountArgs = {
  id: Scalars['Int']['input'];
};


export type QueryBudgetsArgs = {
  year: Scalars['Int']['input'];
};


export type QueryCategoryArgs = {
  id: Scalars['Int']['input'];
};


export type QueryExpenseRequestArgs = {
  id: Scalars['Int']['input'];
};


export type QueryExpenseRequestsPaginatedArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGetPresignedS3UrlArgs = {
  title: Scalars['String']['input'];
};


export type QueryInvoiceArgs = {
  id: Scalars['Int']['input'];
};


export type QueryJournalEntriesArgs = {
  range?: InputMaybe<RangeInput>;
};


export type QueryJournalEntryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryListBudgetsByYearArgs = {
  fiscalYear: Scalars['Int']['input'];
};


export type QueryPaymentArgs = {
  id: Scalars['Int']['input'];
};


export type QueryProfitLossStatementArgs = {
  fiscalYear: Scalars['Int']['input'];
};


export type QueryVoucherArgs = {
  id: Scalars['Int']['input'];
};

export type RangeInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};

/** The state of an expense request */
export type RequestState =
  | 'APPROVED'
  | 'CLOSED'
  | 'DRAFT'
  | 'PAID'
  | 'PENDING'
  | 'REJECTED';

export type Subscription = {
  __typename?: 'Subscription';
  expenseRequestStateChanged: ExpenseRequest;
};

export type UpdateCategoryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateExpenseRequestInput = {
  accountId?: InputMaybe<Scalars['Int']['input']>;
  amount?: InputMaybe<Scalars['Float']['input']>;
  attachmentId?: InputMaybe<Scalars['Int']['input']>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
};

export type UpdateJournalEntryInput = {
  datetime?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  lines?: InputMaybe<Array<JournalLineInput>>;
};

export type UpdatePaymentInput = {
  /** Amount of the payment */
  amount?: InputMaybe<Scalars['Float']['input']>;
  /** IDs of attachments to link to this payment */
  attachmentIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Direction of the payment (IN/OUT) */
  direction?: InputMaybe<PaymentDirection>;
  /** ID of the expense request to associate this payment with */
  expenseRequestId?: InputMaybe<Scalars['Int']['input']>;
  /** ID of the invoice to associate this payment with */
  invoiceId?: InputMaybe<Scalars['Int']['input']>;
  /** Method of the payment (BANK/CASH/OTHER) */
  method?: InputMaybe<PaymentMethod>;
  /** Date when the payment was made */
  paidAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateVoucherInput = {
  /** Example field (placeholder) */
  exampleField?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  isAdmin: Scalars['Boolean']['output'];
  username: Scalars['String']['output'];
};

export type Voucher = {
  __typename?: 'Voucher';
  /** Example field (placeholder) */
  exampleField: Scalars['Int']['output'];
};

export type AccountPartsFragment = { __typename?: 'Account', id: string, code: string, name: string, category: AccountCategory };

export type CreateAccountMutationVariables = Exact<{
  createAccountInput: CreateAccountInput;
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createAccount: { __typename?: 'Account', id: string, code: string, name: string, category: AccountCategory } };

export type GetAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAccountsQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: string, code: string, name: string, category: AccountCategory }> };

export type GetAccountByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetAccountByIdQuery = { __typename?: 'Query', account?: { __typename?: 'Account', id: string, code: string, name: string, category: AccountCategory } | null };

export type ApproveExpenseRequestMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type ApproveExpenseRequestMutation = { __typename?: 'Mutation', approveExpenseRequest: { __typename?: 'ExpenseRequest', id: number, state: RequestState } };

export type CreatePresignedPostMutationVariables = Exact<{
  filename: Scalars['String']['input'];
}>;


export type CreatePresignedPostMutation = { __typename?: 'Mutation', createPresignedPost: { __typename?: 'PresignedPayload', url: string, objectKey: string, fields: Array<{ __typename?: 'PresignedPayloadField', key: string, value: string }> } };

export type CreateAttachmentMutationVariables = Exact<{
  input: CreateAttachmentInput;
}>;


export type CreateAttachmentMutation = { __typename?: 'Mutation', createAttachment: { __typename?: 'Attachment', id: number, s3Key: string, title: string, amount: number } };

export type GetBudgetsQueryVariables = Exact<{
  year: Scalars['Int']['input'];
}>;


export type GetBudgetsQuery = { __typename?: 'Query', budgets: Array<{ __typename?: 'BudgetBalance', categoryId: number, categoryName: string, categoryDescription?: string | null, planned: number, actual: number, remaining: number, ratio: number }> };

export type SetBudgetMutationVariables = Exact<{
  input: BudgetInput;
}>;


export type SetBudgetMutation = { __typename?: 'Mutation', setBudget: { __typename?: 'BudgetDto', id: number, categoryId: number, fiscalYear: number, amountPlanned: number } };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, name: string, description?: string | null, createdAt: string, updatedAt: string }> };

export type CreateCategoryMutationVariables = Exact<{
  createCategoryInput: CreateCategoryInput;
}>;


export type CreateCategoryMutation = { __typename?: 'Mutation', createCategory: { __typename?: 'Category', id: string, name: string, description?: string | null, createdAt: string, updatedAt: string } };

export type UpdateCategoryMutationVariables = Exact<{
  updateCategoryInput: UpdateCategoryInput;
}>;


export type UpdateCategoryMutation = { __typename?: 'Mutation', updateCategory: { __typename?: 'Category', id: string, name: string, description?: string | null, createdAt: string, updatedAt: string } };

export type RemoveCategoryMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type RemoveCategoryMutation = { __typename?: 'Mutation', removeCategory: { __typename?: 'Category', id: string, name: string } };

export type CreateExpenseRequestMutationVariables = Exact<{
  input: CreateExpenseRequestInput;
}>;


export type CreateExpenseRequestMutation = { __typename?: 'Mutation', submitExpenseRequest: { __typename?: 'ExpenseRequest', id: number } };

export type CreatePaymentMutationVariables = Exact<{
  input: CreatePaymentInput;
}>;


export type CreatePaymentMutation = { __typename?: 'Mutation', createPayment: { __typename?: 'Payment', id: number, paidAt: string, amount: number, label: PaymentLabel, invoiceId?: number | null, direction: PaymentDirection, method: PaymentMethod, createdAt?: string | null } };

export type ExpenseRequestByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type ExpenseRequestByIdQuery = { __typename?: 'Query', expenseRequest?: { __typename?: 'ExpenseRequest', id: number, amount: number, state: RequestState, description?: string | null, createdAt: string, approvedAt?: string | null, requester: { __typename?: 'User', id: string, username: string }, approver?: { __typename?: 'User', id: string, username: string } | null, account?: { __typename?: 'Account', id: string, name: string, code: string } | null, category?: { __typename?: 'Category', id: string, name: string, description?: string | null } | null, payment?: { __typename?: 'Payment', id: number, amount: number, paidAt: string, direction: PaymentDirection, method: PaymentMethod, attachments?: Array<{ __typename?: 'Attachment', id: number, s3Key: string, title: string, amount: number } | null> | null } | null, attachment: { __typename?: 'Attachment', id: number, s3Key: string, title: string, amount: number } } | null };

export type SimpleExpenseRequestByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type SimpleExpenseRequestByIdQuery = { __typename?: 'Query', expenseRequest?: { __typename?: 'ExpenseRequest', id: number, amount: number, state: RequestState, createdAt: string, approver?: { __typename?: 'User', id: string, username: string } | null, requester: { __typename?: 'User', id: string, username: string }, payment?: { __typename?: 'Payment', id: number, amount: number, label: PaymentLabel, paidAt: string } | null } | null };

export type ExpenseRequestDetailQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type ExpenseRequestDetailQuery = { __typename?: 'Query', expenseRequest?: { __typename?: 'ExpenseRequest', id: number, amount: number, state: RequestState, createdAt: string, approvedAt?: string | null, description?: string | null, requester: { __typename?: 'User', id: string, username: string }, approver?: { __typename?: 'User', id: string, username: string } | null, attachment: { __typename?: 'Attachment', id: number, title: string, amount: number, createdAt: string, uploader: { __typename?: 'User', id: string, username: string } }, account?: { __typename?: 'Account', id: string, name: string, code: string } | null, category?: { __typename?: 'Category', id: string, name: string, description?: string | null } | null, payment?: { __typename?: 'Payment', id: number, amount: number, paidAt: string, method: PaymentMethod, label: PaymentLabel } | null } | null };

export type ExpenseRequestsListQueryVariables = Exact<{ [key: string]: never; }>;


export type ExpenseRequestsListQuery = { __typename?: 'Query', expenseRequests?: Array<{ __typename?: 'ExpenseRequest', id: number, amount: number, state: RequestState, createdAt: string, attachment: { __typename?: 'Attachment', id: number, title: string }, requester: { __typename?: 'User', id: string, username: string } }> | null };

export type CreateInvoiceMutationVariables = Exact<{
  input: InvoiceInput;
}>;


export type CreateInvoiceMutation = { __typename?: 'Mutation', createInvoice: { __typename?: 'Invoice', id: number, pdfKey: string, status: InvoiceStatus } };

export type GetInvoiceByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetInvoiceByIdQuery = { __typename?: 'Query', invoice: { __typename?: 'Invoice', id: number, pdfKey: string, status: InvoiceStatus, amount: number, partnerName: string, description?: string | null, dueDate: string, invoiceNo: string } };

export type GetInvoicesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInvoicesQuery = { __typename?: 'Query', invoices: Array<{ __typename?: 'Invoice', id: number, invoiceNo: string, partnerName: string, amount: number, status: InvoiceStatus, dueDate: string, createdAt: string }> };

export type GetPresignedS3UrlQueryVariables = Exact<{
  title: Scalars['String']['input'];
}>;


export type GetPresignedS3UrlQuery = { __typename?: 'Query', getPresignedS3Url: { __typename?: 'PresignedPayload', url: string, objectKey: string } };

export type CreateJournalEntryMutationVariables = Exact<{
  createJournalEntryInput: CreateJournalEntryInput;
}>;


export type CreateJournalEntryMutation = { __typename?: 'Mutation', createJournalEntry: { __typename?: 'JournalEntry', id: string, datetime: string, description?: string | null, lines?: Array<{ __typename?: 'JournalLine', id: string, accountId: number, debit?: number | null, credit?: number | null } | null> | null } };

export type GetJournalEntriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetJournalEntriesQuery = { __typename?: 'Query', journalEntries: Array<{ __typename?: 'JournalEntry', id: string, datetime: string, description?: string | null, createdById: number, lines?: Array<{ __typename?: 'JournalLine', id: string, accountId: number, debit?: number | null, credit?: number | null, account?: { __typename?: 'Account', id: string, name: string, code: string, category: AccountCategory } | null } | null> | null }> };

export type GetProfitLossStatementQueryVariables = Exact<{
  fiscalYear: Scalars['Int']['input'];
}>;


export type GetProfitLossStatementQuery = { __typename?: 'Query', profitLossStatement: { __typename?: 'ProfitLossStatement', fiscalYear: number, startDate: string, endDate: string, totalRevenue: number, totalExpense: number, netIncome: number, revenues: Array<{ __typename?: 'AccountSummary', accountId: number, accountCode: string, accountName: string, balance: number }>, expenses: Array<{ __typename?: 'AccountSummary', accountId: number, accountCode: string, accountName: string, balance: number }> } };

export type RejectExpenseRequestMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type RejectExpenseRequestMutation = { __typename?: 'Mutation', rejectExpenseRequest: { __typename?: 'ExpenseRequest', id: number, state: RequestState } };

export type ResubmitExpenseRequestMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type ResubmitExpenseRequestMutation = { __typename?: 'Mutation', resubmitExpenseRequest: { __typename?: 'ExpenseRequest', id: number, state: RequestState, amount: number, createdAt: string, description?: string | null, requester: { __typename?: 'User', id: string, username: string }, attachment: { __typename?: 'Attachment', id: number, title: string, amount: number }, account?: { __typename?: 'Account', id: string, name: string, code: string } | null, category?: { __typename?: 'Category', id: string, name: string } | null } };

export type UpdateExpenseRequestMutationVariables = Exact<{
  input: UpdateExpenseRequestInput;
}>;


export type UpdateExpenseRequestMutation = { __typename?: 'Mutation', updateExpenseRequest: { __typename?: 'ExpenseRequest', id: number, state: RequestState, amount: number, createdAt: string, description?: string | null, requester: { __typename?: 'User', id: string, username: string }, attachment: { __typename?: 'Attachment', id: number, title: string, amount: number }, account?: { __typename?: 'Account', id: string, name: string, code: string } | null, category?: { __typename?: 'Category', id: string, name: string } | null } };

export const AccountPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<AccountPartsFragment, unknown>;
export const CreateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createAccountInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"createAccountInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createAccountInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<CreateAccountMutation, CreateAccountMutationVariables>;
export const GetAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<GetAccountsQuery, GetAccountsQueryVariables>;
export const GetAccountByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAccountById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<GetAccountByIdQuery, GetAccountByIdQueryVariables>;
export const ApproveExpenseRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveExpenseRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveExpenseRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]} as unknown as DocumentNode<ApproveExpenseRequestMutation, ApproveExpenseRequestMutationVariables>;
export const CreatePresignedPostDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createPresignedPost"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filename"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPresignedPost"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filename"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filename"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectKey"}}]}}]}}]} as unknown as DocumentNode<CreatePresignedPostMutation, CreatePresignedPostMutationVariables>;
export const CreateAttachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createAttachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAttachmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAttachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"s3Key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<CreateAttachmentMutation, CreateAttachmentMutationVariables>;
export const GetBudgetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudgets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budgets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"categoryDescription"}},{"kind":"Field","name":{"kind":"Name","value":"planned"}},{"kind":"Field","name":{"kind":"Name","value":"actual"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"ratio"}}]}}]}}]} as unknown as DocumentNode<GetBudgetsQuery, GetBudgetsQueryVariables>;
export const SetBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setBudget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"amountPlanned"}}]}}]}}]} as unknown as DocumentNode<SetBudgetMutation, SetBudgetMutationVariables>;
export const GetCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createCategoryInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"createCategoryInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createCategoryInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UpdateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updateCategoryInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"updateCategoryInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updateCategoryInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const RemoveCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<RemoveCategoryMutation, RemoveCategoryMutationVariables>;
export const CreateExpenseRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateExpenseRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateExpenseRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitExpenseRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateExpenseRequestMutation, CreateExpenseRequestMutationVariables>;
export const CreatePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"createPaymentInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceId"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreatePaymentMutation, CreatePaymentMutationVariables>;
export const ExpenseRequestByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpenseRequestById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"s3Key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"attachment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"s3Key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}}]} as unknown as DocumentNode<ExpenseRequestByIdQuery, ExpenseRequestByIdQueryVariables>;
export const SimpleExpenseRequestByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SimpleExpenseRequestById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"approver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}}]}}]}}]}}]} as unknown as DocumentNode<SimpleExpenseRequestByIdQuery, SimpleExpenseRequestByIdQueryVariables>;
export const ExpenseRequestDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpenseRequestDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attachment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"uploader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]}}]} as unknown as DocumentNode<ExpenseRequestDetailQuery, ExpenseRequestDetailQueryVariables>;
export const ExpenseRequestsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpenseRequestsList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"attachment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]}}]} as unknown as DocumentNode<ExpenseRequestsListQuery, ExpenseRequestsListQueryVariables>;
export const CreateInvoiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createInvoice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InvoiceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInvoice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pdfKey"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateInvoiceMutation, CreateInvoiceMutationVariables>;
export const GetInvoiceByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInvoiceById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pdfKey"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"partnerName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}}]}}]}}]} as unknown as DocumentNode<GetInvoiceByIdQuery, GetInvoiceByIdQueryVariables>;
export const GetInvoicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInvoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}},{"kind":"Field","name":{"kind":"Name","value":"partnerName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetInvoicesQuery, GetInvoicesQueryVariables>;
export const GetPresignedS3UrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPresignedS3Url"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPresignedS3Url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"objectKey"}}]}}]}}]} as unknown as DocumentNode<GetPresignedS3UrlQuery, GetPresignedS3UrlQueryVariables>;
export const CreateJournalEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateJournalEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createJournalEntryInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateJournalEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createJournalEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"createJournalEntryInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createJournalEntryInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"datetime"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"debit"}},{"kind":"Field","name":{"kind":"Name","value":"credit"}}]}}]}}]}}]} as unknown as DocumentNode<CreateJournalEntryMutation, CreateJournalEntryMutationVariables>;
export const GetJournalEntriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetJournalEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"journalEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"datetime"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"debit"}},{"kind":"Field","name":{"kind":"Name","value":"credit"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>;
export const GetProfitLossStatementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProfitLossStatement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fiscalYear"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profitLossStatement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fiscalYear"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fiscalYear"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"revenues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"accountCode"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"accountCode"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"totalExpense"}},{"kind":"Field","name":{"kind":"Name","value":"netIncome"}}]}}]}}]} as unknown as DocumentNode<GetProfitLossStatementQuery, GetProfitLossStatementQueryVariables>;
export const RejectExpenseRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectExpenseRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectExpenseRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]} as unknown as DocumentNode<RejectExpenseRequestMutation, RejectExpenseRequestMutationVariables>;
export const ResubmitExpenseRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResubmitExpenseRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resubmitExpenseRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attachment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ResubmitExpenseRequestMutation, ResubmitExpenseRequestMutationVariables>;
export const UpdateExpenseRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateExpenseRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateExpenseRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateExpenseRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attachment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateExpenseRequestMutation, UpdateExpenseRequestMutationVariables>;