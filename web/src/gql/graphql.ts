/* eslint-disable */
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

export type Attachment = {
  __typename?: 'Attachment';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  s3Key: Scalars['String']['output'];
  title: Scalars['String']['output'];
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

export type CreateJournalEntryInput = {
  datetime?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  lines: Array<JournalLineInput>;
};

export type CreatePaymentInput = {
  /** Amount of the payment */
  amount: Scalars['Float']['input'];
  /** ID of the invoice to associate this payment with */
  invoiceId?: InputMaybe<Scalars['Int']['input']>;
  /** Date when the payment was made */
  paidAt: Scalars['DateTime']['input'];
};

export type CreateVoucherInput = {
  /** Example field (placeholder) */
  exampleField: Scalars['Int']['input'];
};

export type GenerateInvoicePdfInput = {
  amount: Scalars['Float']['input'];
  date: Scalars['String']['input'];
  dueDateText?: InputMaybe<Scalars['String']['input']>;
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

export type MeDto = {
  __typename?: 'MeDto';
  isAdmin: Scalars['Boolean']['output'];
  username: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAccount: Account;
  createAttachment: Attachment;
  createInvoice: Invoice;
  createJournalEntry: JournalEntry;
  createPayment: Payment;
  createPresignedPost: PresignedPayload;
  createVoucher: Voucher;
  generateInvoicePdf: GenerateInvoicePdfPayload;
  removeJournalEntry?: Maybe<JournalEntry>;
  removePayment: Payment;
  removeVoucher: Voucher;
  updateJournalEntry: JournalEntry;
  updatePayment: Payment;
  updateVoucher: Voucher;
};


export type MutationCreateAccountArgs = {
  createAccountInput: CreateAccountInput;
};


export type MutationCreateAttachmentArgs = {
  input: CreateAttachmentInput;
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


export type MutationRemoveJournalEntryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemovePaymentArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveVoucherArgs = {
  id: Scalars['Int']['input'];
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

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Float']['output'];
  id: Scalars['Int']['output'];
  invoice?: Maybe<Invoice>;
  invoiceId?: Maybe<Scalars['Int']['output']>;
  label: PaymentLabel;
  paidAt: Scalars['DateTime']['output'];
};

export type PaymentLabel =
  | 'NORMAL'
  | 'OVERPAY'
  | 'PARTIAL';

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

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accounts: Array<Account>;
  getPresignedS3Url?: Maybe<Scalars['String']['output']>;
  /** Health-check */
  hello: Scalars['String']['output'];
  invoice: Invoice;
  invoices: Array<Invoice>;
  journalEntries: Array<JournalEntry>;
  journalEntry?: Maybe<JournalEntry>;
  /** 現在のユーザーを返す */
  me: MeDto;
  payment?: Maybe<Payment>;
  payments: Array<Payment>;
  voucher: Voucher;
  vouchers: Array<Voucher>;
};


export type QueryAccountArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetPresignedS3UrlArgs = {
  key: Scalars['String']['input'];
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


export type QueryPaymentArgs = {
  id: Scalars['Int']['input'];
};


export type QueryVoucherArgs = {
  id: Scalars['Int']['input'];
};

export type RangeInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
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
  /** ID of the invoice to associate this payment with */
  invoiceId?: InputMaybe<Scalars['Int']['input']>;
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

export type CreatePresignedPostMutationVariables = Exact<{
  filename: Scalars['String']['input'];
}>;


export type CreatePresignedPostMutation = { __typename?: 'Mutation', createPresignedPost: { __typename?: 'PresignedPayload', url: string, objectKey: string, fields: Array<{ __typename?: 'PresignedPayloadField', key: string, value: string }> } };

export type CreateAttachmentMutationVariables = Exact<{
  input: CreateAttachmentInput;
}>;


export type CreateAttachmentMutation = { __typename?: 'Mutation', createAttachment: { __typename?: 'Attachment', id: number, s3Key: string, title: string, amount: number } };

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
  key: Scalars['String']['input'];
}>;


export type GetPresignedS3UrlQuery = { __typename?: 'Query', getPresignedS3Url?: string | null };

export type CreateJournalEntryMutationVariables = Exact<{
  createJournalEntryInput: CreateJournalEntryInput;
}>;


export type CreateJournalEntryMutation = { __typename?: 'Mutation', createJournalEntry: { __typename?: 'JournalEntry', id: string, datetime: string, description?: string | null, lines?: Array<{ __typename?: 'JournalLine', id: string, accountId: number, debit?: number | null, credit?: number | null } | null> | null } };

export type GetJournalEntriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetJournalEntriesQuery = { __typename?: 'Query', journalEntries: Array<{ __typename?: 'JournalEntry', id: string, datetime: string, description?: string | null, createdById: number, lines?: Array<{ __typename?: 'JournalLine', id: string, accountId: number, debit?: number | null, credit?: number | null, account?: { __typename?: 'Account', id: string, name: string, code: string, category: AccountCategory } | null } | null> | null }> };

export const AccountPartsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<AccountPartsFragment, unknown>;
export const CreateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createAccountInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"createAccountInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createAccountInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<CreateAccountMutation, CreateAccountMutationVariables>;
export const GetAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<GetAccountsQuery, GetAccountsQueryVariables>;
export const GetAccountByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAccountById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AccountParts"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountParts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]} as unknown as DocumentNode<GetAccountByIdQuery, GetAccountByIdQueryVariables>;
export const CreatePresignedPostDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createPresignedPost"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filename"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPresignedPost"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filename"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filename"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectKey"}}]}}]}}]} as unknown as DocumentNode<CreatePresignedPostMutation, CreatePresignedPostMutationVariables>;
export const CreateAttachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createAttachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAttachmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAttachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"s3Key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<CreateAttachmentMutation, CreateAttachmentMutationVariables>;
export const CreateInvoiceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createInvoice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InvoiceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInvoice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pdfKey"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateInvoiceMutation, CreateInvoiceMutationVariables>;
export const GetInvoiceByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInvoiceById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pdfKey"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"partnerName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}}]}}]}}]} as unknown as DocumentNode<GetInvoiceByIdQuery, GetInvoiceByIdQueryVariables>;
export const GetInvoicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInvoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}},{"kind":"Field","name":{"kind":"Name","value":"partnerName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetInvoicesQuery, GetInvoicesQueryVariables>;
export const GetPresignedS3UrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPresignedS3Url"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPresignedS3Url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}]}]}}]} as unknown as DocumentNode<GetPresignedS3UrlQuery, GetPresignedS3UrlQueryVariables>;
export const CreateJournalEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateJournalEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createJournalEntryInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateJournalEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createJournalEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"createJournalEntryInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createJournalEntryInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"datetime"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"debit"}},{"kind":"Field","name":{"kind":"Name","value":"credit"}}]}}]}}]}}]} as unknown as DocumentNode<CreateJournalEntryMutation, CreateJournalEntryMutationVariables>;
export const GetJournalEntriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetJournalEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"journalEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"datetime"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdById"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"debit"}},{"kind":"Field","name":{"kind":"Name","value":"credit"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>;