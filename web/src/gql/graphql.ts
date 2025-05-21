/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
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

export type Attachment = {
  __typename?: 'Attachment';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  s3Key: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type CreateAttachmentInput = {
  amount: Scalars['Float']['input'];
  s3Key: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateVoucherInput = {
  /** Example field (placeholder) */
  exampleField: Scalars['Int']['input'];
};

export type MeDto = {
  __typename?: 'MeDto';
  isAdmin: Scalars['Boolean']['output'];
  username: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAttachment: Attachment;
  createPresignedPost: PresignedPayload;
  createVoucher: Voucher;
  removeVoucher: Voucher;
  updateVoucher: Voucher;
};


export type MutationCreateAttachmentArgs = {
  input: CreateAttachmentInput;
};


export type MutationCreatePresignedPostArgs = {
  filename: Scalars['String']['input'];
};


export type MutationCreateVoucherArgs = {
  createVoucherInput: CreateVoucherInput;
};


export type MutationRemoveVoucherArgs = {
  id: Scalars['Int']['input'];
};


export type MutationUpdateVoucherArgs = {
  updateVoucherInput: UpdateVoucherInput;
};

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
  /** Health-check */
  hello: Scalars['String']['output'];
  /** 現在のユーザーを返す */
  me: MeDto;
  voucher: Voucher;
  vouchers: Array<Voucher>;
};


export type QueryVoucherArgs = {
  id: Scalars['Int']['input'];
};

export type UpdateVoucherInput = {
  /** Example field (placeholder) */
  exampleField?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
};

export type Voucher = {
  __typename?: 'Voucher';
  /** Example field (placeholder) */
  exampleField: Scalars['Int']['output'];
};

export type CreatePresignedPostMutationVariables = Exact<{
  filename: Scalars['String']['input'];
}>;


export type CreatePresignedPostMutation = { __typename?: 'Mutation', createPresignedPost: { __typename?: 'PresignedPayload', url: string, objectKey: string, fields: Array<{ __typename?: 'PresignedPayloadField', key: string, value: string }> } };

export type CreateAttachmentMutationVariables = Exact<{
  input: CreateAttachmentInput;
}>;


export type CreateAttachmentMutation = { __typename?: 'Mutation', createAttachment: { __typename?: 'Attachment', id: number, s3Key: string, title: string, amount: number } };


export const CreatePresignedPostDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createPresignedPost"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filename"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPresignedPost"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filename"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filename"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectKey"}}]}}]}}]} as unknown as DocumentNode<CreatePresignedPostMutation, CreatePresignedPostMutationVariables>;
export const CreateAttachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createAttachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAttachmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAttachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"s3Key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<CreateAttachmentMutation, CreateAttachmentMutationVariables>;
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

export type Attachment = {
  __typename?: 'Attachment';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  s3Key: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type CreateAttachmentInput = {
  amount: Scalars['Float']['input'];
  s3Key: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateVoucherInput = {
  /** Example field (placeholder) */
  exampleField: Scalars['Int']['input'];
};

export type MeDto = {
  __typename?: 'MeDto';
  isAdmin: Scalars['Boolean']['output'];
  username: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAttachment: Attachment;
  createPresignedPost: PresignedPayload;
  createVoucher: Voucher;
  removeVoucher: Voucher;
  updateVoucher: Voucher;
};


export type MutationCreateAttachmentArgs = {
  input: CreateAttachmentInput;
};


export type MutationCreatePresignedPostArgs = {
  filename: Scalars['String']['input'];
};


export type MutationCreateVoucherArgs = {
  createVoucherInput: CreateVoucherInput;
};


export type MutationRemoveVoucherArgs = {
  id: Scalars['Int']['input'];
};


export type MutationUpdateVoucherArgs = {
  updateVoucherInput: UpdateVoucherInput;
};

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
  /** Health-check */
  hello: Scalars['String']['output'];
  /** 現在のユーザーを返す */
  me: MeDto;
  voucher: Voucher;
  vouchers: Array<Voucher>;
};


export type QueryVoucherArgs = {
  id: Scalars['Int']['input'];
};

export type UpdateVoucherInput = {
  /** Example field (placeholder) */
  exampleField?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
};

export type Voucher = {
  __typename?: 'Voucher';
  /** Example field (placeholder) */
  exampleField: Scalars['Int']['output'];
};

export type CreatePresignedPostMutationVariables = Exact<{
  filename: Scalars['String']['input'];
}>;


export type CreatePresignedPostMutation = { __typename?: 'Mutation', createPresignedPost: { __typename?: 'PresignedPayload', url: string, objectKey: string, fields: Array<{ __typename?: 'PresignedPayloadField', key: string, value: string }> } };

export type CreateAttachmentMutationVariables = Exact<{
  input: CreateAttachmentInput;
}>;


export type CreateAttachmentMutation = { __typename?: 'Mutation', createAttachment: { __typename?: 'Attachment', id: number, s3Key: string, title: string, amount: number } };


export const CreatePresignedPostDocument = gql`
    mutation createPresignedPost($filename: String!) {
  createPresignedPost(filename: $filename) {
    url
    fields {
      key
      value
    }
    objectKey
  }
}
    `;

export function useCreatePresignedPostMutation() {
  return Urql.useMutation<CreatePresignedPostMutation, CreatePresignedPostMutationVariables>(CreatePresignedPostDocument);
};
export const CreateAttachmentDocument = gql`
    mutation createAttachment($input: CreateAttachmentInput!) {
  createAttachment(input: $input) {
    id
    s3Key
    title
    amount
  }
}
    `;

export function useCreateAttachmentMutation() {
  return Urql.useMutation<CreateAttachmentMutation, CreateAttachmentMutationVariables>(CreateAttachmentDocument);
};