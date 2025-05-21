import { CreateAttachmentInput } from "@/gql/graphql";
import { graphql } from '@/gql';
import { useMutation } from "urql";

const createPresignedPostMutationDocument = graphql(`
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
  `
);

const createAttachmentMutationDocument = graphql(`
    mutation createAttachment($input: CreateAttachmentInput!) {
      createAttachment(input: $input) {
        id
        s3Key
        title
        amount
      }
    }
  `
);

export const useCreatePresignedPost = () => {
  const [result, mutate] = useMutation(
    createPresignedPostMutationDocument);

    return {
      loading: result.fetching,
      error: result.error,
      presignedPost: async (filename: string) => {
        const { data } = await mutate({ filename });
        if (data?.createPresignedPost) {
          return data.createPresignedPost;
        }
        throw new Error("Failed to create presigned post");
      }
    }
} 

export const useCreateAttachment = () => {
  const [result, mutate] = useMutation(
    createAttachmentMutationDocument);

    return {
      loading: result.fetching,
      error: result.error,
      createAttachment: async (input: CreateAttachmentInput) => {
        const { data } = await mutate({ input });
        if (data?.createAttachment) {
          return data.createAttachment;
        }
        throw new Error("Failed to create attachment");
      }
    }
}
