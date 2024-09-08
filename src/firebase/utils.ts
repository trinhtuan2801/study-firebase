import {
  StorageReference,
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from 'firebase/storage';
import firebaseServices from './services';
import { resizeImage } from '@/utils/file-utils';
import { genIdByDate } from '@/utils/string-utils';
const { storage } = firebaseServices;

export const uploadImage = async (
  file: File,
  dimensions?: { width: number; height: number },
) => {
  const resizedImage = await resizeImage(file, dimensions);

  const storageRef = ref(storage, `cakes/${genIdByDate()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, resizedImage);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};

export const getAllImages = async (folder: string) => {
  const listRef = ref(storage, `${folder}`);
  const response = await listAll(listRef);
  const imageRefs = response.items;
  const imageUrls: string[] = await Promise.all(
    imageRefs.map((imageRef) => getDownloadURL(imageRef)),
  );
  const result: { ref: StorageReference; url: string }[] = [];
  for (let i = 0; i < imageRefs.length; i++) {
    result.push({
      ref: imageRefs[i],
      url: imageUrls[i],
    });
  }

  return result;
};

export const deleteImage = async (imageRef: StorageReference) => {
  return deleteObject(imageRef);
};
