import { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { FirebaseQueryOptions } from '../query';

type UseInfinityTableProps<TItem = any> = {
  fetchFn: (
    queryOptions: FirebaseQueryOptions<TItem>,
  ) => Promise<{ data: TItem[]; snapshots: QuerySnapshot<DocumentData, DocumentData> }>;
  baseQueryOptions: FirebaseQueryOptions<TItem>;
  getItemId?: (item: TItem) => string;
  fetchItemFn?: (id: string) => Promise<{ data: TItem }>;
  limit?: number;
};

export default function useFirebaseInfinityQuery<TItem = any>({
  fetchFn,
  baseQueryOptions,
  limit = 10,
  fetchItemFn,
  getItemId = (item) => (item as any)?.id,
}: UseInfinityTableProps<TItem>) {
  const lastDocRef = useRef<any>();

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const latestGetNextDataIdRef = useRef(0);
  const prevData = useRef<TItem[]>([]);
  const [data, setData] = useState<TItem[]>([]);
  const [snapshots, setSnapshots] = useState<QuerySnapshot<DocumentData, DocumentData>>();

  const [endOfList, setEndOfList] = useState(false);

  const { ref: lastElementRef, inView } = useInView();

  const getNextData = async () => {
    console.log('useFirebaseInfinityQuery - getNextData');
    setIsFetching(true);
    latestGetNextDataIdRef.current++;
    const getNextDataId = latestGetNextDataIdRef.current;
    const { data: nextData, snapshots } = await fetchFn({
      ...baseQueryOptions,
      limit,
      startAfter: lastDocRef.current,
    });
    if (getNextDataId !== latestGetNextDataIdRef.current) return;
    const newData = [...prevData.current, ...nextData];
    prevData.current = newData;
    setData(newData);
    setSnapshots(snapshots);
    setIsLoading(false);
    setTimeout(() => {
      setIsFetching(false);
    }, 200);
  };

  const refresh = async () => {
    console.log('useFirebaseInfinityQuery - refresh');
    const { data } = await fetchFn({
      ...baseQueryOptions,
      endAt: lastDocRef.current,
    });
    if (!data) return;
    setData(data);
  };

  const reset = () => {
    console.log('useFirebaseInfinityQuery - reset');
    lastDocRef.current = null;
    setIsLoading(true);
    prevData.current = [];
    setData([]);
    setEndOfList(false);
    getNextData();
  };

  const refreshItem = async (id: string) => {
    console.log('useFirebaseInfinityQuery - refreshItem', id);
    if (!fetchItemFn || !getItemId) return;
    setIsFetching(true);
    const { data: newItem } = await fetchItemFn(id);
    setIsFetching(false);
    const newData = [...data];
    const oldItemIndex = newData.findIndex((oldItem) => getItemId(oldItem) === id);
    if (oldItemIndex === -1) return;
    newData.splice(oldItemIndex, 1, newItem);
    setData(newData);
  };

  useEffect(() => {
    getNextData();
  }, []);

  useEffect(() => {
    if (!snapshots) return;
    if (snapshots.empty) {
      setEndOfList(true);
    } else {
      setEndOfList(false);
      lastDocRef.current = snapshots.docs[snapshots.docs.length - 1];
    }
  }, [snapshots]);

  useEffect(() => {
    if (inView && !isFetching) {
      getNextData();
    }
  }, [inView, isFetching]);

  return {
    data,
    isLoading,
    isFetching,
    endOfList,
    refresh,
    refreshItem,
    lastElementRef,
    reset,
    getNextData,
  };
}
