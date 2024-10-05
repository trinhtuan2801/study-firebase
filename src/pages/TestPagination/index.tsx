import { getUser, getUsers } from '@/api/user';
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
import useFirebaseInfinityQuery from '@/firebase/hooks/useFirebaseInfinityQuery';
import { UserData } from '@/types/user';
import { faker } from '@faker-js/faker';
import { Pencil2Icon } from '@radix-ui/react-icons';
import EditUserDialog, { useEditUserDialogRef } from './EditUserDialog';
import { useRef } from 'react';

export default function TestPagination() {
  const {
    data,
    endOfList,
    isLoading,
    isFetching,
    lastElementRef,
    getNextData,
    refresh,
    refreshItem,
  } = useFirebaseInfinityQuery({
    fetchFn: async (queryOptions) => {
      const { snapshots, users } = await getUsers({
        firebaseQueryOptions: queryOptions,
      });
      return { data: users, snapshots };
    },
    fetchItemFn: async (id) => {
      const data = await getUser(id);
      return { data };
    },
    baseQueryOptions: {
      where: [
        ['order', '>=', 10],
        ['order', '<=', 50],
      ],
      orderBy: 'order',
    },
    limit: 10,
  });

  const editUserDialogRef = useEditUserDialogRef();

  const addNewUser = () => {
    addDocument(Collection.USERS, {
      order: data.length + 1,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }).then(() => {
      getNextData();
    });
  };

  const updateUser = (user: UserData) => {};

  if (isLoading) return <p>Initial Loading...</p>;

  return (
    <div>
      <div className='max-h-[300px] overflow-auto border border-border rounded-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-background sticky top-0'>
              <TableHead>Order</TableHead>
              <TableHead>First name</TableHead>
              <TableHead>Last name</TableHead>
              <TableHead className='w-[100px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((user) => {
              const { firstName, lastName, id, order } = user;
              return (
                <TableRow key={id}>
                  <TableCell>{order}</TableCell>
                  <TableCell>{firstName}</TableCell>
                  <TableCell>{lastName}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        editUserDialogRef.current?.open(user);
                      }}
                    >
                      <Pencil2Icon />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!endOfList && (
              <TableRow ref={lastElementRef}>
                <TableCell colSpan={3}>Loading...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <EditUserDialog
          onFinish={(newUserData) => {
            refreshItem(newUserData.id);
          }}
          ref={editUserDialogRef}
        />
      </div>
      <div className='mt-2 flex gap-2'>
        <Button onClick={addNewUser} disabled={isFetching}>
          Add User
        </Button>
        <Button onClick={refresh} disabled={isFetching}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
