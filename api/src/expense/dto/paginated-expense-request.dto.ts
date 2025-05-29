import { ObjectType, Field } from '@nestjs/graphql';
import { ExpenseRequest } from '../entities/expense-request.entity';
import { PaginationInfo } from '../../common/dto/paginated-response.dto';

@ObjectType()
export class PaginatedExpenseRequestResponse {
  @Field(() => [ExpenseRequest])
  items: ExpenseRequest[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
