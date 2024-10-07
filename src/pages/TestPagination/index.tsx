import { getUser, getUsers } from '@/api/user';
import VSelect from '@/components/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Collection } from '@/firebase/constant';
import { addDocument, getDocumentById } from '@/firebase/crud';
import useFirebaseInfinityQuery from '@/firebase/hooks/useFirebaseInfinityQuery';
import { cn } from '@/lib/utils';
import { UserData } from '@/types/user';
import { faker } from '@faker-js/faker';
import { CalendarIcon, Pencil2Icon } from '@radix-ui/react-icons';
import { addDays, endOfDay, format } from 'date-fns';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import EditUserDialog, { useEditUserDialogRef } from './EditUserDialog';
import { Calendar } from '@/components/ui/calendar';

export default function TestPagination() {
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 9, 7),
    to: new Date(),
  });
  const {
    data,
    endOfList,
    isLoading,
    isFetching,
    lastElementRef,
    getNextData,
    refresh,
    refreshItem,
    reset,
  } = useFirebaseInfinityQuery<UserData>({
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
        ['createdDate', '>=', new Date(dateRange?.from ?? '').getTime()],
        ['createdDate', '<=', endOfDay(new Date(dateRange?.to ?? '')).getTime()],
      ],
      orderBy: 'createdDate',
    },
    limit,
  });

  const editUserDialogRef = useEditUserDialogRef();

  const addNewUser = () => {
    addDocument(Collection.USERS, {
      createdDate: Date.now(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }).then(() => {
      getNextData();
    });
  };

  useEffect(() => {
    reset();
  }, [dateRange, limit]);

  return (
    <div className='flex flex-col gap-2'>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <p>Date:</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button id='date' variant={'outline'} className='w-fit'>
              <CalendarIcon className='mr-2' />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              initialFocus
              mode='range'
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <p>Limit: </p>
        <VSelect
          value={limit.toString()}
          onChange={(v) => setLimit(Number(v))}
          options={[
            { label: '10', value: '10' },
            { label: '20', value: '20' },
            { label: '30', value: '30' },
          ]}
          placeholder='Limit'
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className='max-h-[300px] overflow-auto border border-border rounded-sm mt-2'>
            <Table>
              <TableHeader>
                <TableRow className='bg-background sticky top-0'>
                  <TableHead>Created Date</TableHead>
                  <TableHead>First name</TableHead>
                  <TableHead>Last name</TableHead>
                  <TableHead className='w-[100px]'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((user) => {
                  const { firstName, lastName, id, createdDate } = user;
                  return (
                    <TableRow key={id}>
                      <TableCell>{format(createdDate, 'dd/MM/yyyy - hh:mm:ss')}</TableCell>
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
        </>
      )}
    </div>
  );
}
