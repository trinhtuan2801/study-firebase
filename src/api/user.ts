import { Collection } from '@/firebase/constant';
import { getDocumentById, getDocuments, GetDocumentsOptions } from '@/firebase/crud';
import { UserData } from '@/types/user';

export const getUsers = async (options?: GetDocumentsOptions) => {
  const snapshots = await getDocuments(Collection.USERS, options);
  const users = snapshots.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return {
    users: users as UserData[],
    snapshots,
  };
};

export const getUser = async (id: string) => {
  const userDoc = await getDocumentById(Collection.USERS, id);
  return { ...userDoc.data(), id: userDoc.id } as UserData;
};
