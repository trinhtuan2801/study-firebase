import {
  endAt,
  endBefore,
  limit,
  orderBy,
  OrderByDirection,
  QueryConstraint,
  startAfter,
  startAt,
  where,
  WhereFilterOp,
} from 'firebase/firestore';

export type Query =
  | WhereQuery
  | OrderQuery
  | LimitQuery
  | StartAtQuery
  | StartAfterQuery
  | EndAtQuery
  | EndBeforeQuery;

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

export interface StartAtQuery {
  type: 'start-at';
  value: any;
}

export interface StartAtQuery {
  type: 'start-at';
  value: any;
}

export interface StartAfterQuery {
  type: 'start-after';
  value: any;
}

export interface EndAtQuery {
  type: 'end-at';
  value: any;
}

export interface EndBeforeQuery {
  type: 'end-before';
  value: any;
}

export type GetQueries = (...queries: Query[]) => QueryConstraint[];

export const getQueries: GetQueries = (...queries) => {
  return queries
    .map((queryObject) => {
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
        case 'start-at': {
          const { value } = queryObject;
          if (value == undefined) return undefined;
          return startAt(value);
        }
        case 'start-after': {
          const { value } = queryObject;
          if (value == undefined) return undefined;
          return startAfter(value);
        }
        case 'end-at': {
          const { value } = queryObject;
          if (value == undefined) return undefined;
          return endAt(value);
        }
        case 'end-before': {
          const { value } = queryObject;
          if (value == undefined) return undefined;
          return endBefore(value);
        }
      }
    })
    .filter((query) => query != undefined);
};
