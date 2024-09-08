import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  QuerySnapshot,
  setDoc,
} from 'firebase/firestore';
import firebaseServices from './services';
import { Collection } from './constant';
import { getQuery, QueryObject } from './query';

const { firestore } = firebaseServices;

export const getDocumentById = (collectionName: Collection, id: string) => {
  return getDoc(doc(firestore, collectionName, id));
};

export type GetDocumentsOptions = {
  queries: QueryObject[];
};

export type GetDocuments = (
  collection: Collection,
  options?: GetDocumentsOptions,
) => Promise<QuerySnapshot<DocumentData, DocumentData>>;

export const getDocuments: GetDocuments = (collectionName, options) => {
  const { queries = [] } = options || {};

  return getDocs(query(collection(firestore, collectionName), ...getQuery(...queries)));
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
