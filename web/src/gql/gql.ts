/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment AccountParts on Account {\n    id\n    code\n    name\n    category\n  }\n": typeof types.AccountPartsFragmentDoc,
    "\n  mutation createAccount($createAccountInput: CreateAccountInput!) {\n    createAccount(createAccountInput: $createAccountInput) {\n      ...AccountParts\n    }\n  }\n": typeof types.CreateAccountDocument,
    "\n  query getAccounts {\n    accounts {\n      ...AccountParts\n    }\n  }\n": typeof types.GetAccountsDocument,
    "\n  query getAccountById($id: Int!) {\n    account(id: $id) {\n      ...AccountParts\n    }\n  }\n": typeof types.GetAccountByIdDocument,
    "\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  ": typeof types.CreatePresignedPostDocument,
    "\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  ": typeof types.CreateAttachmentDocument,
    "\n    mutation createInvoice($input: InvoiceInput!) {\n      createInvoice(input: $input) {\n        id\n        pdfKey\n        status\n      }\n    }\n  ": typeof types.CreateInvoiceDocument,
    "\n  query GetInvoiceById($id: Int!) {\n    invoice(id: $id) {\n      id\n      pdfKey\n      status\n      amount\n      partnerName\n      description\n      dueDate\n      invoiceNo\n    }\n  }\n": typeof types.GetInvoiceByIdDocument,
    "\n  query GetInvoices {\n    invoices {\n      id\n      invoiceNo\n      partnerName\n      amount\n      status\n      dueDate\n      createdAt\n    }\n  }\n": typeof types.GetInvoicesDocument,
    "\n  query GetPresignedS3Url($key: String!) {\n    getPresignedS3Url(key: $key)\n  }\n": typeof types.GetPresignedS3UrlDocument,
    "\n  mutation CreateJournalEntry($createJournalEntryInput: CreateJournalEntryInput!) {\n    createJournalEntry(createJournalEntryInput: $createJournalEntryInput) {\n      id\n      datetime\n      description\n      lines {\n        id\n        accountId\n        debit\n        credit\n      }\n    }\n  }\n": typeof types.CreateJournalEntryDocument,
    "\n  query GetJournalEntries {\n    journalEntries {\n      id\n      datetime\n      description\n      createdById\n      lines {\n        id\n        accountId\n        debit\n        credit\n        account {\n          id\n          name\n          code\n          category\n        }\n      }\n    }\n  }\n": typeof types.GetJournalEntriesDocument,
};
const documents: Documents = {
    "\n  fragment AccountParts on Account {\n    id\n    code\n    name\n    category\n  }\n": types.AccountPartsFragmentDoc,
    "\n  mutation createAccount($createAccountInput: CreateAccountInput!) {\n    createAccount(createAccountInput: $createAccountInput) {\n      ...AccountParts\n    }\n  }\n": types.CreateAccountDocument,
    "\n  query getAccounts {\n    accounts {\n      ...AccountParts\n    }\n  }\n": types.GetAccountsDocument,
    "\n  query getAccountById($id: Int!) {\n    account(id: $id) {\n      ...AccountParts\n    }\n  }\n": types.GetAccountByIdDocument,
    "\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  ": types.CreatePresignedPostDocument,
    "\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  ": types.CreateAttachmentDocument,
    "\n    mutation createInvoice($input: InvoiceInput!) {\n      createInvoice(input: $input) {\n        id\n        pdfKey\n        status\n      }\n    }\n  ": types.CreateInvoiceDocument,
    "\n  query GetInvoiceById($id: Int!) {\n    invoice(id: $id) {\n      id\n      pdfKey\n      status\n      amount\n      partnerName\n      description\n      dueDate\n      invoiceNo\n    }\n  }\n": types.GetInvoiceByIdDocument,
    "\n  query GetInvoices {\n    invoices {\n      id\n      invoiceNo\n      partnerName\n      amount\n      status\n      dueDate\n      createdAt\n    }\n  }\n": types.GetInvoicesDocument,
    "\n  query GetPresignedS3Url($key: String!) {\n    getPresignedS3Url(key: $key)\n  }\n": types.GetPresignedS3UrlDocument,
    "\n  mutation CreateJournalEntry($createJournalEntryInput: CreateJournalEntryInput!) {\n    createJournalEntry(createJournalEntryInput: $createJournalEntryInput) {\n      id\n      datetime\n      description\n      lines {\n        id\n        accountId\n        debit\n        credit\n      }\n    }\n  }\n": types.CreateJournalEntryDocument,
    "\n  query GetJournalEntries {\n    journalEntries {\n      id\n      datetime\n      description\n      createdById\n      lines {\n        id\n        accountId\n        debit\n        credit\n        account {\n          id\n          name\n          code\n          category\n        }\n      }\n    }\n  }\n": types.GetJournalEntriesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AccountParts on Account {\n    id\n    code\n    name\n    category\n  }\n"): (typeof documents)["\n  fragment AccountParts on Account {\n    id\n    code\n    name\n    category\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createAccount($createAccountInput: CreateAccountInput!) {\n    createAccount(createAccountInput: $createAccountInput) {\n      ...AccountParts\n    }\n  }\n"): (typeof documents)["\n  mutation createAccount($createAccountInput: CreateAccountInput!) {\n    createAccount(createAccountInput: $createAccountInput) {\n      ...AccountParts\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getAccounts {\n    accounts {\n      ...AccountParts\n    }\n  }\n"): (typeof documents)["\n  query getAccounts {\n    accounts {\n      ...AccountParts\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getAccountById($id: Int!) {\n    account(id: $id) {\n      ...AccountParts\n    }\n  }\n"): (typeof documents)["\n  query getAccountById($id: Int!) {\n    account(id: $id) {\n      ...AccountParts\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  "): (typeof documents)["\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  "): (typeof documents)["\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation createInvoice($input: InvoiceInput!) {\n      createInvoice(input: $input) {\n        id\n        pdfKey\n        status\n      }\n    }\n  "): (typeof documents)["\n    mutation createInvoice($input: InvoiceInput!) {\n      createInvoice(input: $input) {\n        id\n        pdfKey\n        status\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetInvoiceById($id: Int!) {\n    invoice(id: $id) {\n      id\n      pdfKey\n      status\n      amount\n      partnerName\n      description\n      dueDate\n      invoiceNo\n    }\n  }\n"): (typeof documents)["\n  query GetInvoiceById($id: Int!) {\n    invoice(id: $id) {\n      id\n      pdfKey\n      status\n      amount\n      partnerName\n      description\n      dueDate\n      invoiceNo\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetInvoices {\n    invoices {\n      id\n      invoiceNo\n      partnerName\n      amount\n      status\n      dueDate\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetInvoices {\n    invoices {\n      id\n      invoiceNo\n      partnerName\n      amount\n      status\n      dueDate\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPresignedS3Url($key: String!) {\n    getPresignedS3Url(key: $key)\n  }\n"): (typeof documents)["\n  query GetPresignedS3Url($key: String!) {\n    getPresignedS3Url(key: $key)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateJournalEntry($createJournalEntryInput: CreateJournalEntryInput!) {\n    createJournalEntry(createJournalEntryInput: $createJournalEntryInput) {\n      id\n      datetime\n      description\n      lines {\n        id\n        accountId\n        debit\n        credit\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateJournalEntry($createJournalEntryInput: CreateJournalEntryInput!) {\n    createJournalEntry(createJournalEntryInput: $createJournalEntryInput) {\n      id\n      datetime\n      description\n      lines {\n        id\n        accountId\n        debit\n        credit\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetJournalEntries {\n    journalEntries {\n      id\n      datetime\n      description\n      createdById\n      lines {\n        id\n        accountId\n        debit\n        credit\n        account {\n          id\n          name\n          code\n          category\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetJournalEntries {\n    journalEntries {\n      id\n      datetime\n      description\n      createdById\n      lines {\n        id\n        accountId\n        debit\n        credit\n        account {\n          id\n          name\n          code\n          category\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;