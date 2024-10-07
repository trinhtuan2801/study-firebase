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

export type FirebaseQueryOptions<DType = any> = {
  where?: WhereQuery<DType> | (WhereQuery<DType> | undefined)[];
  orderBy?: keyof DType;
  orderByDirection?: OrderByDirection;
  limit?: number;
  startAt?: any;
  startAfter?: any;
  endAt?: any;
  endBefore?: any;
};

export type WhereQuery<DType = any> = [keyof DType, WhereFilterOp, any];

export function getFirebaseQueries<DType = any>(
  query?: FirebaseQueryOptions<DType>,
): QueryConstraint[] {
  const { where, orderBy, orderByDirection, limit, startAt, startAfter, endAt, endBefore } =
    query || {};
  const result: QueryConstraint[] = [];
  if (where != undefined) {
    if (Array.isArray(where[0])) {
      result.push(
        ...where
          .filter(Boolean)
          .map(([field, operator, value]) => firebaseWhere(field, operator, value)),
      );
    } else {
      const [field, operator, value] = where as WhereQuery;
      result.push(firebaseWhere(field as string, operator, value));
    }
  }

  if (orderBy != undefined) {
    result.push(firebaseOrderBy(orderBy as string, orderByDirection));
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
}
