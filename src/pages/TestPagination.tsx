import { getUsers } from '@/api/user';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Collection } from '@/firebase/constant';
import { addDocument } from '@/firebase/crud';
import { UserData } from '@/types/user';
import { faker } from '@faker-js/faker';
import { useQuery } from '@tanstack/react-query';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function TestPagination() {
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData, DocumentData>>();
  const [endOfList, setEndOfList] = useState(false);
  const [list, setList] = useState<UserData[]>([]);
  const { data, refetch, isPending, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: async () =>
      getUsers({
        queries: [
          { type: 'order', field: 'order' },
          { type: 'limit', limit: 10 },
          { type: 'start-after', value: lastDocRef.current },
        ],
      }),
    refetchOnWindowFocus: false,
  });

  const refreshList = async () => {
    const { users } = await getUsers({
      queries: [
        { type: 'order', field: 'order' },
        { type: 'end-at', value: lastDocRef.current },
      ],
    });
    setList(users);
  };

  const { users, snapshot } = data || {};
  const { ref: lastElementRef, inView } = useInView();

  useEffect(() => {
    if (!users) return;
    setList((prev) => [...prev, ...users]);
  }, [users]);

  useEffect(() => {
    if (inView) {
      refetch();
    }
  }, [inView]);

  useEffect(() => {
    if (!snapshot) return;
    if (snapshot.empty) {
      setEndOfList(true);
    } else {
      setEndOfList(false);
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
    }
  }, [snapshot]);

  const addNewUser = () => {
    addDocument(Collection.USERS, {
      order: list.length + 1,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }).then(() => {
      refetch();
    });
  };

  return (
    <div>
      <div className='max-h-[200px] overflow-auto border border-border rounded-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-background sticky top-0'>
              <TableHead>Order</TableHead>
              <TableHead>First name</TableHead>
              <TableHead>Last name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list?.map(({ firstName, lastName, id, order }) => (
              <TableRow key={id}>
                <TableCell>{order}</TableCell>
                <TableCell>{firstName}</TableCell>
                <TableCell>{lastName}</TableCell>
              </TableRow>
            ))}
            {!endOfList && (
              <TableRow ref={lastElementRef}>
                <TableCell colSpan={3}>Loading...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='mt-2 flex gap-2'>
        <Button onClick={addNewUser} disabled={isPending || isFetching}>
          Add User
        </Button>
        <Button onClick={refreshList} disabled={isPending || isFetching}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
