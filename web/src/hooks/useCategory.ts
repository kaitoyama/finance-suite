import { graphql } from '../gql';
import { useQuery, useMutation } from 'urql';

const GetCategoriesQueryDocument = graphql(`
  query GetCategories {
    categories {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`);

const CreateCategoryMutationDocument = graphql(`
  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {
    createCategory(createCategoryInput: $createCategoryInput) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`);

const UpdateCategoryMutationDocument = graphql(`
  mutation UpdateCategory($updateCategoryInput: UpdateCategoryInput!) {
    updateCategory(updateCategoryInput: $updateCategoryInput) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`);

const RemoveCategoryMutationDocument = graphql(`
  mutation RemoveCategory($id: Int!) {
    removeCategory(id: $id) {
      id
      name
    }
  }
`);

export const useGetCategories = () => {
  const [{ data, fetching, error }, refetch] = useQuery({
    query: GetCategoriesQueryDocument,
  });

  return {
    loading: fetching,
    error: error,
    categories: data?.categories,
    refetch,
  };
};

export const useCreateCategory = () => {
  const [, createCategoryMutation] = useMutation(CreateCategoryMutationDocument);

  const createCategory = async (input: { name: string; description?: string }) => {
    const result = await createCategoryMutation({ createCategoryInput: input });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result;
  };

  return {
    createCategory,
  };
};

export const useUpdateCategory = () => {
  const [, updateCategoryMutation] = useMutation(UpdateCategoryMutationDocument);

  const updateCategory = async (input: { id: number; name?: string; description?: string }) => {
    const result = await updateCategoryMutation({ updateCategoryInput: input });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result;
  };

  return {
    updateCategory,
  };
};

export const useRemoveCategory = () => {
  const [, removeCategoryMutation] = useMutation(RemoveCategoryMutationDocument);

  const removeCategory = async (id: number) => {
    const result = await removeCategoryMutation({ id });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result;
  };

  return {
    removeCategory,
  };
};