import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UserData } from '@/types/user';
import { ElementRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { updateDocument } from '@/firebase/crud';
import { Collection } from '@/firebase/constant';

type Props = {
  onFinish?: (newUserData: UserData) => void;
};

type EditUserDialogRef = {
  open: (userData: UserData) => void;
};

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  order: z.number(),
});

const EditUserDialog = forwardRef<EditUserDialogRef, Props>(function EditUserDialog(
  { onFinish },
  ref,
) {
  const [userData, setUserData] = useState<UserData>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
  });

  const updateUserData: SubmitHandler<UserData> = async (newUserData) => {
    const { id, ...data } = newUserData;
    setLoading(true);
    await updateDocument(Collection.USERS, id, data);
    setLoading(false);
    setOpen(false);
    onFinish?.(newUserData);
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        open: (userData: UserData) => {
          setUserData(userData);
          setOpen(true);
        },
      };
    },
    [],
  );

  useEffect(() => {
    if (userData) {
      form.reset(userData);
    }
  }, [userData]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) setOpen(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{userData?.firstName}</DialogTitle>
          <DialogDescription>Update user data</DialogDescription>
        </DialogHeader>
        <div className='mt-2'>
          <div className='flex flex-col gap-2'>
            <Input disabled placeholder='order' {...form.register('id')} />
            <div className='flex gap-2'>
              <Input placeholder='firstName' {...form.register('firstName')} />
              <Input placeholder='lastName' {...form.register('lastName')} />
            </div>
            <Input
              placeholder='order'
              type='number'
              {...form.register('order', {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='ghost' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(updateUserData, (errors) => {
              console.log(errors);
            })}
            disabled={loading}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default EditUserDialog;

export const useEditUserDialogRef = () => {
  const ref = useRef<ElementRef<typeof EditUserDialog>>(null);
  return ref;
};
