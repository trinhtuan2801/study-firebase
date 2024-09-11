import { Collection } from '@/firebase/constant';
import { getDocuments, GetDocumentsOptions } from '@/firebase/crud';
import { UserData } from '@/types/user';

export const getUsers = async (options?: GetDocumentsOptions) => {
  const snapshot = await getDocuments(Collection.USERS, options);
  const users = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return {
    users: users as UserData[],
    snapshot,
  };
};
