import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query as firebaseQuery,
  QuerySnapshot,
  setDoc,
} from 'firebase/firestore';
import firebaseServices from './services';
import { Collection } from './constant';
import { getFirebaseQueries, FirebaseQueryOptions } from './query';

const { firestore } = firebaseServices;

export const getDocumentById = (collectionName: Collection, id: string) => {
  return getDoc(doc(firestore, collectionName, id));
};

export type GetDocumentsOptions = {
  firebaseQueryOptions?: FirebaseQueryOptions;
}

export type GetDocuments = (
  collection: Collection,
  options?: GetDocumentsOptions,
) => Promise<QuerySnapshot<DocumentData, DocumentData>>;

export const getDocuments: GetDocuments = (collectionName, options) => {
  const { firebaseQueryOptions: query } = options || {};

  return getDocs(firebaseQuery(collection(firestore, collectionName), ...getFirebaseQueries(query)));
};

export const addDocument = (collectionName: Collection, data: object) => {
  return addDoc(collection(firestore, collectionName), data);
};

export const updateDocument = (collectionName: Collection, id: string, data: object) => {
  return setDoc(doc(firestore, collectionName, id), data, { merge: true });
};

export const deleteDocument = (collectionName: Collection, id: string) => {
  return deleteDoc(doc(firestore, collectionName, id));
};
