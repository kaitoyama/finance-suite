import { graphql } from '../gql';
import { useQuery } from 'urql';

const GetProfitLossStatementQueryDocument = graphql(`
  query GetProfitLossStatement($fiscalYear: Int!) {
    profitLossStatement(fiscalYear: $fiscalYear) {
      fiscalYear
      startDate
      endDate
      revenues {
        accountId
        accountCode
        accountName
        balance
      }
      expenses {
        accountId
        accountCode
        accountName
        balance
      }
      totalRevenue
      totalExpense
      netIncome
    }
  }
`);

export const useProfitLossStatement = (fiscalYear: number | undefined) => {
  const [{ data, fetching, error }, refetch] = useQuery({
    query: GetProfitLossStatementQueryDocument,
    variables: { fiscalYear: fiscalYear! },
    pause: !fiscalYear,
  });

  return {
    loading: fetching,
    error: error,
    profitLossStatement: data?.profitLossStatement,
    refetch,
  };
};