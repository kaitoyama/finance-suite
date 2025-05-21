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
    "\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  ": typeof types.CreatePresignedPostDocument,
    "\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  ": typeof types.CreateAttachmentDocument,
};
const documents: Documents = {
    "\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  ": types.CreatePresignedPostDocument,
    "\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  ": types.CreateAttachmentDocument,
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
export function graphql(source: "\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  "): (typeof documents)["\n    mutation createPresignedPost($filename: String!) {\n      createPresignedPost(filename: $filename) {\n        url\n        fields {\n          key\n          value\n        }\n        objectKey\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  "): (typeof documents)["\n    mutation createAttachment($input: CreateAttachmentInput!) {\n      createAttachment(input: $input) {\n        id\n        s3Key\n        title\n        amount\n      }\n    }\n  "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;