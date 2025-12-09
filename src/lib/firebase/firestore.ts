import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  GeoPoint,
  increment,
  arrayUnion,
  arrayRemove,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import type { User, Salon, QueueItem, Rating, Stylist } from '@/types';

// User operations
export const createUser = async (userId: string, userData: Omit<User, 'id'>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: Timestamp.now(),
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return { id: userSnap.id, ...userSnap.data() } as User;
};

export const updateUser = async (userId: string, data: Partial<User>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

// Salon operations
export const getSalons = async (): Promise<Salon[]> => {
  const salonsRef = collection(db, 'salons');
  const snapshot = await getDocs(salonsRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Salon[];
};

export const getSalon = async (salonId: string): Promise<Salon | null> => {
  const salonRef = doc(db, 'salons', salonId);
  const salonSnap = await getDoc(salonRef);
  if (!salonSnap.exists()) return null;
  return { id: salonSnap.id, ...salonSnap.data() } as Salon;
};

export const subscribeSalon = (
  salonId: string,
  callback: (salon: Salon | null) => void
) => {
  const salonRef = doc(db, 'salons', salonId);
  return onSnapshot(salonRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Salon);
    } else {
      callback(null);
    }
  });
};

// Stylist operations
export const getStylists = async (salonId: string): Promise<Stylist[]> => {
  const stylistsRef = collection(db, 'salons', salonId, 'stylists');
  const snapshot = await getDocs(stylistsRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Stylist[];
};

export const subscribeStylists = (
  salonId: string,
  callback: (stylists: Stylist[]) => void
) => {
  const stylistsRef = collection(db, 'salons', salonId, 'stylists');
  return onSnapshot(stylistsRef, (snapshot) => {
    const stylists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Stylist[];
    callback(stylists);
  });
};

// Queue operations
export const getQueue = async (salonId: string): Promise<QueueItem[]> => {
  const queueRef = collection(db, 'salons', salonId, 'queue');
  const q = query(queueRef, where('status', '==', 'waiting'), orderBy('createdAt'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as QueueItem[];
};

export const subscribeQueue = (
  salonId: string,
  callback: (queue: QueueItem[]) => void
) => {
  const queueRef = collection(db, 'salons', salonId, 'queue');
  const q = query(queueRef, where('status', '==', 'waiting'), orderBy('createdAt'));
  return onSnapshot(q, (snapshot) => {
    const queue = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QueueItem[];
    callback(queue);
  });
};

// Rating operations
export const getSalonRatings = async (salonId: string): Promise<Rating[]> => {
  const ratingsRef = collection(db, 'ratings');
  const q = query(
    ratingsRef,
    where('salonId', '==', salonId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Rating[];
};
