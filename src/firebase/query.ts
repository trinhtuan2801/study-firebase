import {
  endAt as firebaseEndAt,
  endBefore as firebaseEndBefore,
  limit as firebaseLimit,
  orderBy as firebaseOrderBy,
  OrderByDirection,
  QueryConstraint,
  startAfter as firebaseStartAfter,
  startAt as firebaseStartAt,
  where as firebaseWhere,
  WhereFilterOp,
} from 'firebase/firestore';

export type Query = {
  where?: WhereQuery | WhereQuery[];
  orderBy?: string;
  orderByDirection?: OrderByDirection;
  limit?: number;
  startAt?: any;
  startAfter?: any;
  endAt?: any;
  endBefore?: any;
};

export interface WhereQuery {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export type GetQueries = (query?: Query) => QueryConstraint[];

export const getFirebaseQueries: GetQueries = (query) => {
  const { where, orderBy, orderByDirection, limit, startAt, startAfter, endAt, endBefore } =
    query || {};
  const result: QueryConstraint[] = [];
  if (where != undefined) {
    if (Array.isArray(where)) {
      result.push(
        ...where.map(({ field, operator, value }) => firebaseWhere(field, operator, value)),
      );
    } else {
      const { field, operator, value } = where;
      result.push(firebaseWhere(field, operator, value));
    }
  }

  if (orderBy != undefined) {
    result.push(firebaseOrderBy(orderBy, orderByDirection));
  }

  if (limit != undefined) {
    result.push(firebaseLimit(limit));
  }

  if (startAt != undefined) {
    result.push(firebaseStartAt(startAt));
  }

  if (startAfter != undefined) {
    result.push(firebaseStartAfter(startAfter));
  }

  if (endAt != undefined) {
    result.push(firebaseEndAt(endAt));
  }

  if (endBefore != undefined) {
    result.push(firebaseEndBefore(endBefore));
  }

  return result;
};
