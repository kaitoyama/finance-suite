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
    "\n  mutation ApproveExpenseRequest($id: Int!) {\n    approveExpenseRequest(id: $id) {\n      id\n      state\n    }\n  }\n": typeof types.ApproveExpenseRequestDocument,
    "\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  ": typeof types.CreatePresignedPostDocument,
    "\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  ": typeof types.CreateAttachmentDocument,
    "\n  query GetBudgets($year: Int!) {\n    budgets(year: $year) {\n      categoryId\n      categoryName\n      categoryDescription\n      planned\n      actual\n      remaining\n      ratio\n    }\n  }\n": typeof types.GetBudgetsDocument,
    "\n  mutation SetBudget($input: BudgetInput!) {\n    setBudget(input: $input) {\n      id\n      categoryId\n      fiscalYear\n      amountPlanned\n    }\n  }\n": typeof types.SetBudgetDocument,
    "\n  query GetCategories {\n    categories {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetCategoriesDocument,
    "\n  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {\n    createCategory(createCategoryInput: $createCategoryInput) {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateCategoryDocument,
    "\n  mutation UpdateCategory($updateCategoryInput: UpdateCategoryInput!) {\n    updateCategory(updateCategoryInput: $updateCategoryInput) {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateCategoryDocument,
    "\n  mutation RemoveCategory($id: Int!) {\n    removeCategory(id: $id) {\n      id\n      name\n    }\n  }\n": typeof types.RemoveCategoryDocument,
    "\n  mutation CreateExpenseRequest($input: CreateExpenseRequestInput!) {\n    submitExpenseRequest(input: $input) {\n      id\n    }\n  }\n": typeof types.CreateExpenseRequestDocument,
    "\n  mutation CreatePayment($input: CreatePaymentInput!) {\n    createPayment(createPaymentInput: $input) {\n      id\n      paidAt\n      amount\n      label\n      invoiceId\n      direction\n      method\n      createdAt\n    }\n  }\n": typeof types.CreatePaymentDocument,
    "\n  query ExpenseRequestById($id: Int!) {\n    expenseRequest(id: $id) {\n      id\n      amount\n      state\n      createdAt\n      approvedAt\n      requester {\n        id\n        username\n      }\n      approver {\n        id\n        username\n      }\n      payment {\n        id\n        amount\n        paidAt\n        direction\n        method\n        attachments {\n            id\n            s3Key\n            title\n            amount\n        }\n      }\n      attachment {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  }\n": typeof types.ExpenseRequestByIdDocument,
    "\n  query SimpleExpenseRequestById($id: Int!) {\n    expenseRequest(id: $id) {\n      id,\n      amount,\n      state,\n      createdAt,\n      approver {\n        id,\n        username,\n      },\n      requester {\n        id,\n        username,\n      },\n      payment {\n        id,\n        amount,\n        label,\n        paidAt,\n      },\n    }\n  }\n": typeof types.SimpleExpenseRequestByIdDocument,
    "\n  query ExpenseRequestsList {\n    expenseRequests {\n      id\n      amount\n      state\n      createdAt\n      attachment {\n        id\n        title\n      }\n      # We might need more fields depending on AC-2 like requester name\n      requester {\n        id\n        username\n      }\n      # Consider adding a field for attachment count if available directly\n      # or retrieve attachments and count them on the client, though less ideal.\n    }\n  }\n": typeof types.ExpenseRequestsListDocument,
    "\n    mutation createInvoice($input: InvoiceInput!) {\n      createInvoice(input: $input) {\n        id\n        pdfKey\n        status\n      }\n    }\n  ": typeof types.CreateInvoiceDocument,
    "\n  query GetInvoiceById($id: Int!) {\n    invoice(id: $id) {\n      id\n      pdfKey\n      status\n      amount\n      partnerName\n      description\n      dueDate\n      invoiceNo\n    }\n  }\n": typeof types.GetInvoiceByIdDocument,
    "\n  query GetInvoices {\n    invoices {\n      id\n      invoiceNo\n      partnerName\n      amount\n      status\n      dueDate\n      createdAt\n    }\n  }\n": typeof types.GetInvoicesDocument,
    "\n  query GetPresignedS3Url($title: String!) {\n    getPresignedS3Url(title: $title) {\n      url\n      objectKey\n    }\n  }\n": typeof types.GetPresignedS3UrlDocument,
    "\n  mutation CreateJournalEntry($createJournalEntryInput: CreateJournalEntryInput!) {\n    createJournalEntry(createJournalEntryInput: $createJournalEntryInput) {\n      id\n      datetime\n      description\n      lines {\n        id\n        accountId\n        debit\n        credit\n      }\n    }\n  }\n": typeof types.CreateJournalEntryDocument,
    "\n  query GetJournalEntries {\n    journalEntries {\n      id\n      datetime\n      description\n      createdById\n      lines {\n        id\n        accountId\n        debit\n        credit\n        account {\n          id\n          name\n          code\n          category\n        }\n      }\n    }\n  }\n": typeof types.GetJournalEntriesDocument,
    "\n  query GetProfitLossStatement($fiscalYear: Int!) {\n    profitLossStatement(fiscalYear: $fiscalYear) {\n      fiscalYear\n      startDate\n      endDate\n      revenues {\n        accountId\n        accountCode\n        accountName\n        balance\n      }\n      expenses {\n        accountId\n        accountCode\n        accountName\n        balance\n      }\n      totalRevenue\n      totalExpense\n      netIncome\n    }\n  }\n": typeof types.GetProfitLossStatementDocument,
    "\n  mutation RejectExpenseRequest($id: Int!) {\n    rejectExpenseRequest(id: $id) {\n      id\n      state\n    }\n  }\n": typeof types.RejectExpenseRequestDocument,
};
const documents: Documents = {
    "\n  fragment AccountParts on Account {\n    id\n    code\n    name\n    category\n  }\n": types.AccountPartsFragmentDoc,
    "\n  mutation createAccount($createAccountInput: CreateAccountInput!) {\n    createAccount(createAccountInput: $createAccountInput) {\n      ...AccountParts\n    }\n  }\n": types.CreateAccountDocument,
    "\n  query getAccounts {\n    accounts {\n      ...AccountParts\n    }\n  }\n": types.GetAccountsDocument,
    "\n  query getAccountById($id: Int!) {\n    account(id: $id) {\n      ...AccountParts\n    }\n  }\n": types.GetAccountByIdDocument,
    "\n  mutation ApproveExpenseRequest($id: Int!) {\n    approveExpenseRequest(id: $id) {\n      id\n      state\n    }\n  }\n": types.ApproveExpenseRequestDocument,
    "\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  ": types.CreatePresignedPostDocument,
    "\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  ": types.CreateAttachmentDocument,
    "\n  query GetBudgets($year: Int!) {\n    budgets(year: $year) {\n      categoryId\n      categoryName\n      categoryDescription\n      planned\n      actual\n      remaining\n      ratio\n    }\n  }\n": types.GetBudgetsDocument,
    "\n  mutation SetBudget($input: BudgetInput!) {\n    setBudget(input: $input) {\n      id\n      categoryId\n      fiscalYear\n      amountPlanned\n    }\n  }\n": types.SetBudgetDocument,
    "\n  query GetCategories {\n    categories {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetCategoriesDocument,
    "\n  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {\n    createCategory(createCategoryInput: $createCategoryInput) {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateCategoryDocument,
    "\n  mutation UpdateCategory($updateCategoryInput: UpdateCategoryInput!) {\n    updateCategory(updateCategoryInput: $updateCategoryInput) {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateCategoryDocument,
    "\n  mutation RemoveCategory($id: Int!) {\n    removeCategory(id: $id) {\n      id\n      name\n    }\n  }\n": types.RemoveCategoryDocument,
    "\n  mutation CreateExpenseRequest($input: CreateExpenseRequestInput!) {\n    submitExpenseRequest(input: $input) {\n      id\n    }\n  }\n": types.CreateExpenseRequestDocument,
    "\n  mutation CreatePayment($input: CreatePaymentInput!) {\n    createPayment(createPaymentInput: $input) {\n      id\n      paidAt\n      amount\n      label\n      invoiceId\n      direction\n      method\n      createdAt\n    }\n  }\n": types.CreatePaymentDocument,
    "\n  query ExpenseRequestById($id: Int!) {\n    expenseRequest(id: $id) {\n      id\n      amount\n      state\n      createdAt\n      approvedAt\n      requester {\n        id\n        username\n      }\n      approver {\n        id\n        username\n      }\n      payment {\n        id\n        amount\n        paidAt\n        direction\n        method\n        attachments {\n            id\n            s3Key\n            title\n            amount\n        }\n      }\n      attachment {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  }\n": types.ExpenseRequestByIdDocument,
    "\n  query SimpleExpenseRequestById($id: Int!) {\n    expenseRequest(id: $id) {\n      id,\n      amount,\n      state,\n      createdAt,\n      approver {\n        id,\n        username,\n      },\n      requester {\n        id,\n        username,\n      },\n      payment {\n        id,\n        amount,\n        label,\n        paidAt,\n      },\n    }\n  }\n": types.SimpleExpenseRequestByIdDocument,
    "\n  query ExpenseRequestsList {\n    expenseRequests {\n      id\n      amount\n      state\n      createdAt\n      attachment {\n        id\n        title\n      }\n      # We might need more fields depending on AC-2 like requester name\n      requester {\n        id\n        username\n      }\n      # Consider adding a field for attachment count if available directly\n      # or retrieve attachments and count them on the client, though less ideal.\n    }\n  }\n": types.ExpenseRequestsListDocument,
    "\n    mutation createInvoice($input: InvoiceInput!) {\n      createInvoice(input: $input) {\n        id\n        pdfKey\n        status\n      }\n    }\n  ": types.CreateInvoiceDocument,
    "\n  query GetInvoiceById($id: Int!) {\n    invoice(id: $id) {\n      id\n      pdfKey\n      status\n      amount\n      partnerName\n      description\n      dueDate\n      invoiceNo\n    }\n  }\n": types.GetInvoiceByIdDocument,
    "\n  query GetInvoices {\n    invoices {\n      id\n      invoiceNo\n      partnerName\n      amount\n      status\n      dueDate\n      createdAt\n    }\n  }\n": types.GetInvoicesDocument,
    "\n  query GetPresignedS3Url($title: String!) {\n    getPresignedS3Url(title: $title) {\n      url\n      objectKey\n    }\n  }\n": types.GetPresignedS3UrlDocument,
    "\n  mutation CreateJournalEntry($createJournalEntryInput: CreateJournalEntryInput!) {\n    createJournalEntry(createJournalEntryInput: $createJournalEntryInput) {\n      id\n      datetime\n      description\n      lines {\n        id\n        accountId\n        debit\n        credit\n      }\n    }\n  }\n": types.CreateJournalEntryDocument,
    "\n  query GetJournalEntries {\n    journalEntries {\n      id\n      datetime\n      description\n      createdById\n      lines {\n        id\n        accountId\n        debit\n        credit\n        account {\n          id\n          name\n          code\n          category\n        }\n      }\n    }\n  }\n": types.GetJournalEntriesDocument,
    "\n  query GetProfitLossStatement($fiscalYear: Int!) {\n    profitLossStatement(fiscalYear: $fiscalYear) {\n      fiscalYear\n      startDate\n      endDate\n      revenues {\n        accountId\n        accountCode\n        accountName\n        balance\n      }\n      expenses {\n        accountId\n        accountCode\n        accountName\n        balance\n      }\n      totalRevenue\n      totalExpense\n      netIncome\n    }\n  }\n": types.GetProfitLossStatementDocument,
    "\n  mutation RejectExpenseRequest($id: Int!) {\n    rejectExpenseRequest(id: $id) {\n      id\n      state\n    }\n  }\n": types.RejectExpenseRequestDocument,
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
export function graphql(source: "\n  mutation ApproveExpenseRequest($id: Int!) {\n    approveExpenseRequest(id: $id) {\n      id\n      state\n    }\n  }\n"): (typeof documents)["\n  mutation ApproveExpenseRequest($id: Int!) {\n    approveExpenseRequest(id: $id) {\n      id\n      state\n    }\n  }\n"];
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
export function graphql(source: "\n  query GetBudgets($year: Int!) {\n    budgets(year: $year) {\n      categoryId\n      categoryName\n      categoryDescription\n      planned\n      actual\n      remaining\n      ratio\n    }\n  }\n"): (typeof documents)["\n  query GetBudgets($year: Int!) {\n    budgets(year: $year) {\n      categoryId\n      categoryName\n      categoryDescription\n      planned\n      actual\n      remaining\n      ratio\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetBudget($input: BudgetInput!) {\n    setBudget(input: $input) {\n      id\n      categoryId\n      fiscalYear\n      amountPlanned\n    }\n  }\n"): (typeof documents)["\n  mutation SetBudget($input: BudgetInput!) {\n    setBudget(input: $input) {\n      id\n      categoryId\n      fiscalYear\n      amountPlanned\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCategories {\n    categories {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetCategories {\n    categories {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {\n    createCategory(createCategoryInput: $createCategoryInput) {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {\n    createCategory(createCategoryInput: $createCategoryInput) {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCategory($updateCategoryInput: UpdateCategoryInput!) {\n    updateCategory(updateCategoryInput: $updateCategoryInput) {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCategory($updateCategoryInput: UpdateCategoryInput!) {\n    updateCategory(updateCategoryInput: $updateCategoryInput) {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveCategory($id: Int!) {\n    removeCategory(id: $id) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveCategory($id: Int!) {\n    removeCategory(id: $id) {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateExpenseRequest($input: CreateExpenseRequestInput!) {\n    submitExpenseRequest(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateExpenseRequest($input: CreateExpenseRequestInput!) {\n    submitExpenseRequest(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePayment($input: CreatePaymentInput!) {\n    createPayment(createPaymentInput: $input) {\n      id\n      paidAt\n      amount\n      label\n      invoiceId\n      direction\n      method\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePayment($input: CreatePaymentInput!) {\n    createPayment(createPaymentInput: $input) {\n      id\n      paidAt\n      amount\n      label\n      invoiceId\n      direction\n      method\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ExpenseRequestById($id: Int!) {\n    expenseRequest(id: $id) {\n      id\n      amount\n      state\n      createdAt\n      approvedAt\n      requester {\n        id\n        username\n      }\n      approver {\n        id\n        username\n      }\n      payment {\n        id\n        amount\n        paidAt\n        direction\n        method\n        attachments {\n            id\n            s3Key\n            title\n            amount\n        }\n      }\n      attachment {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  }\n"): (typeof documents)["\n  query ExpenseRequestById($id: Int!) {\n    expenseRequest(id: $id) {\n      id\n      amount\n      state\n      createdAt\n      approvedAt\n      requester {\n        id\n        username\n      }\n      approver {\n        id\n        username\n      }\n      payment {\n        id\n        amount\n        paidAt\n        direction\n        method\n        attachments {\n            id\n            s3Key\n            title\n            amount\n        }\n      }\n      attachment {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SimpleExpenseRequestById($id: Int!) {\n    expenseRequest(id: $id) {\n      id,\n      amount,\n      state,\n      createdAt,\n      approver {\n        id,\n        username,\n      },\n      requester {\n        id,\n        username,\n      },\n      payment {\n        id,\n        amount,\n        label,\n        paidAt,\n      },\n    }\n  }\n"): (typeof documents)["\n  query SimpleExpenseRequestById($id: Int!) {\n    expenseRequest(id: $id) {\n      id,\n      amount,\n      state,\n      createdAt,\n      approver {\n        id,\n        username,\n      },\n      requester {\n        id,\n        username,\n      },\n      payment {\n        id,\n        amount,\n        label,\n        paidAt,\n      },\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ExpenseRequestsList {\n    expenseRequests {\n      id\n      amount\n      state\n      createdAt\n      attachment {\n        id\n        title\n      }\n      # We might need more fields depending on AC-2 like requester name\n      requester {\n        id\n        username\n      }\n      # Consider adding a field for attachment count if available directly\n      # or retrieve attachments and count them on the client, though less ideal.\n    }\n  }\n"): (typeof documents)["\n  query ExpenseRequestsList {\n    expenseRequests {\n      id\n      amount\n      state\n      createdAt\n      attachment {\n        id\n        title\n      }\n      # We might need more fields depending on AC-2 like requester name\n      requester {\n        id\n        username\n      }\n      # Consider adding a field for attachment count if available directly\n      # or retrieve attachments and count them on the client, though less ideal.\n    }\n  }\n"];
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
export function graphql(source: "\n  query GetPresignedS3Url($title: String!) {\n    getPresignedS3Url(title: $title) {\n      url\n      objectKey\n    }\n  }\n"): (typeof documents)["\n  query GetPresignedS3Url($title: String!) {\n    getPresignedS3Url(title: $title) {\n      url\n      objectKey\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateJournalEntry($createJournalEntryInput: CreateJournalEntryInput!) {\n    createJournalEntry(createJournalEntryInput: $createJournalEntryInput) {\n      id\n      datetime\n      description\n      lines {\n        id\n        accountId\n        debit\n        credit\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateJournalEntry($createJournalEntryInput: CreateJournalEntryInput!) {\n    createJournalEntry(createJournalEntryInput: $createJournalEntryInput) {\n      id\n      datetime\n      description\n      lines {\n        id\n        accountId\n        debit\n        credit\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetJournalEntries {\n    journalEntries {\n      id\n      datetime\n      description\n      createdById\n      lines {\n        id\n        accountId\n        debit\n        credit\n        account {\n          id\n          name\n          code\n          category\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetJournalEntries {\n    journalEntries {\n      id\n      datetime\n      description\n      createdById\n      lines {\n        id\n        accountId\n        debit\n        credit\n        account {\n          id\n          name\n          code\n          category\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetProfitLossStatement($fiscalYear: Int!) {\n    profitLossStatement(fiscalYear: $fiscalYear) {\n      fiscalYear\n      startDate\n      endDate\n      revenues {\n        accountId\n        accountCode\n        accountName\n        balance\n      }\n      expenses {\n        accountId\n        accountCode\n        accountName\n        balance\n      }\n      totalRevenue\n      totalExpense\n      netIncome\n    }\n  }\n"): (typeof documents)["\n  query GetProfitLossStatement($fiscalYear: Int!) {\n    profitLossStatement(fiscalYear: $fiscalYear) {\n      fiscalYear\n      startDate\n      endDate\n      revenues {\n        accountId\n        accountCode\n        accountName\n        balance\n      }\n      expenses {\n        accountId\n        accountCode\n        accountName\n        balance\n      }\n      totalRevenue\n      totalExpense\n      netIncome\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RejectExpenseRequest($id: Int!) {\n    rejectExpenseRequest(id: $id) {\n      id\n      state\n    }\n  }\n"): (typeof documents)["\n  mutation RejectExpenseRequest($id: Int!) {\n    rejectExpenseRequest(id: $id) {\n      id\n      state\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;