import {
  limit,
  orderBy,
  OrderByDirection,
  QueryFieldFilterConstraint,
  QueryLimitConstraint,
  QueryOrderByConstraint,
  where,
  WhereFilterOp,
} from 'firebase/firestore';

export type QueryObject = WhereQuery | OrderQuery | LimitQuery;

export interface WhereQuery {
  type: 'where';
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface OrderQuery {
  type: 'order';
  field: string;
  order?: OrderByDirection;
}

export interface LimitQuery {
  type: 'limit';
  limit: number;
}

export type GetQuery = (
  ...queryObjects: QueryObject[]
) => (QueryFieldFilterConstraint | QueryOrderByConstraint | QueryLimitConstraint)[];

export const getQuery: GetQuery = (...queryObjects) => {
  return queryObjects.map((queryObject) => {
    switch (queryObject.type) {
      case 'where': {
        const { field, operator, value } = queryObject;
        return where(field, operator, value);
      }
      case 'order': {
        const { field, order = 'asc' } = queryObject;
        return orderBy(field, order);
      }
      case 'limit': {
        const { limit: value } = queryObject;
        return limit(value);
      }
    }
  });
};
