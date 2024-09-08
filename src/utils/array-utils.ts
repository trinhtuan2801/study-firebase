import { normalizeStr } from './string-utils';

export const duplicateArray = (arr: any[], times = 1) => {
  const result = [];
  for (let i = 0; i < times; i++) {
    result.push(...arr);
  }
  return result;
};

export type ArrayCompareFn = ((a: any, b: any) => number) | undefined;

export type SorterCreator = (
  keyMap: string,
  order: 'asc' | 'desc',
  isGreater?: (a: any, b: any) => boolean,
) => ArrayCompareFn;

export const sorterCreator: SorterCreator =
  (keyMap, order, isGreater = (a, b) => a > b) =>
  (a, b) => {
    if (keyMap) {
      keyMap.split('.').forEach((key) => {
        a = a[key];
        b = b[key];
      });
    }
    if (typeof a === 'string') a = normalizeStr(a);
    if (typeof b === 'string') b = normalizeStr(b);

    let result = 0;
    const isAscending = order === 'asc';
    if (isGreater(a, b)) result = isAscending ? 1 : -1;
    else if (!isGreater(a, b)) result = isAscending ? -1 : 1;
    return result;
  };
