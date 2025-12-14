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
  runTransaction,
} from 'firebase/firestore';
import { db } from './config';
import type { User, Salon, QueueItem, Rating, Stylist, Report, Service, Appointment, Feedback } from '@/types';

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

export const updateUserLoyaltyPoints = async (userId: string, pointsToAdd: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    loyaltyPoints: increment(pointsToAdd)
  });
};

export const subscribeUser = (
  userId: string,
  callback: (user: User | null) => void,
  onError?: (error: Error) => void
) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(
    userRef,
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as User);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error subscribing to user:", error);
      if (onError) onError(error);
    }
  );
};

export const updateSalon = async (salonId: string, data: Partial<Salon>) => {
  const salonRef = doc(db, 'salons', salonId);
  //@ts-ignore
  await updateDoc(salonRef, data);
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

export const getSalonByOwner = async (ownerId: string): Promise<Salon | null> => {
  const salonsRef = collection(db, 'salons');
  const q = query(salonsRef, where('ownerId', '==', ownerId), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Salon;
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

export const registerSalon = async (salonId: string, salonData: Omit<Salon, 'id'>) => {
  const salonRef = doc(db, 'salons', salonId);
  await setDoc(salonRef, {
    ...salonData,
    createdAt: Timestamp.now(),
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

export const addStylist = async (salonId: string, stylistData: Omit<Stylist, 'id'>) => {
  const stylistsRef = collection(db, 'salons', salonId, 'stylists');
  await setDoc(doc(stylistsRef), {
    ...stylistData,
    createdAt: Timestamp.now(),
  });

  // Increment onDutyCount if the new stylist is on duty
  if (stylistData.isOnDuty) {
    const salonRef = doc(db, 'salons', salonId);
    await updateDoc(salonRef, {
      onDutyCount: increment(1)
    });
  }
};

export const deleteStylist = async (salonId: string, stylistId: string, wasOnDuty: boolean) => {
  const stylistRef = doc(db, 'salons', salonId, 'stylists', stylistId);
  await deleteDoc(stylistRef);

  // Decrement onDutyCount if they were on duty
  if (wasOnDuty) {
    const salonRef = doc(db, 'salons', salonId);
    await updateDoc(salonRef, {
      onDutyCount: increment(-1)
    });
  }
};

export const updateStylist = async (salonId: string, stylistId: string, data: Partial<Stylist>) => {
  const stylistRef = doc(db, 'salons', salonId, 'stylists', stylistId);
  await updateDoc(stylistRef, data);

  // If isOnDuty status changed, update salon count
  if (data.isOnDuty !== undefined) {
    const salonRef = doc(db, 'salons', salonId);
    await updateDoc(salonRef, {
      onDutyCount: increment(data.isOnDuty ? 1 : -1)
    });
  }
};

// Service operations
export const getServices = async (salonId: string): Promise<Service[]> => {
  const servicesRef = collection(db, 'salons', salonId, 'services');
  const snapshot = await getDocs(servicesRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Service[];
};

export const subscribeServices = (
  salonId: string,
  callback: (services: Service[]) => void
) => {
  const servicesRef = collection(db, 'salons', salonId, 'services');
  return onSnapshot(servicesRef, (snapshot) => {
    const services = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Service[];
    callback(services);
  });
};

export const addService = async (salonId: string, serviceData: Omit<Service, 'id'>) => {
  const servicesRef = collection(db, 'salons', salonId, 'services');
  await setDoc(doc(servicesRef), {
    ...serviceData,
    createdAt: Timestamp.now(),
  });
};

export const updateService = async (salonId: string, serviceId: string, serviceData: Partial<Service>) => {
  const serviceRef = doc(db, 'salons', salonId, 'services', serviceId);
  await updateDoc(serviceRef, serviceData);
};

export const deleteService = async (salonId: string, serviceId: string) => {
  const serviceRef = doc(db, 'salons', salonId, 'services', serviceId);
  await deleteDoc(serviceRef);
};

// Appointment operations
export const createAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
  const appointmentsRef = collection(db, 'appointments');
  await setDoc(doc(appointmentsRef), {
    ...appointmentData,
    createdAt: Timestamp.now(),
  });
};

export const getSalonAppointments = async (salonId: string, date?: string): Promise<Appointment[]> => {
  const appointmentsRef = collection(db, 'appointments');
  let q;

  if (date) {
    q = query(
      appointmentsRef,
      where('salonId', '==', salonId),
      where('date', '==', date),
      where('status', '==', 'booked'),
      orderBy('time')
    );
  } else {
    q = query(
      appointmentsRef,
      where('salonId', '==', salonId),
      where('status', '==', 'booked'),
      orderBy('date'),
      orderBy('time')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Appointment[];
};

export const getUserAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');

    // Simple query - filter by userId only
    // Removing orderBy to strictly avoid index creation requirements during dev
    const q = query(
      appointmentsRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const allAppointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];

    // Sort and filter in memory
    return allAppointments
      .filter(apt =>
        apt.status === 'booked' || apt.status === 'completed' || apt.status === 'cancelled'
      )
      .sort((a, b) => {
        // Handle Firestore Timestamp or JS Date or ISO string
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending
      });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
};

export const subscribeToUserAppointments = (
  userId: string,
  callback: (appointments: Appointment[]) => void
) => {
  const appointmentsRef = collection(db, 'appointments');
  const q = query(
    appointmentsRef,
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];

    // Sort client-side
    const sorted = appointments
      .filter(apt =>
        apt.status === 'booked' || apt.status === 'completed' || apt.status === 'cancelled'
      )
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

    callback(sorted);
  });
};

export const updateAppointment = async (appointmentId: string, data: Partial<Appointment>) => {
  const appointmentRef = doc(db, 'appointments', appointmentId);
  await updateDoc(appointmentRef, data);
};

export const cancelAppointment = async (appointmentId: string) => {
  const appointmentRef = doc(db, 'appointments', appointmentId);
  await updateDoc(appointmentRef, {
    status: 'cancelled',
  });
};

export const subscribeAppointments = (
  salonId: string,
  callback: (appointments: Appointment[]) => void
) => {
  const appointmentsRef = collection(db, 'appointments');
  const q = query(
    appointmentsRef,
    where('salonId', '==', salonId),
    orderBy('date'),
    orderBy('time')
  );

  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
    callback(appointments);
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

// [UPDATED] Atomic Add to Queue with Daily Reset
export const addToQueue = async (salonId: string, item: Omit<QueueItem, 'id' | 'queueNumber'>) => {
  const salonRef = doc(db, 'salons', salonId);
  const queueCollectionRef = collection(db, 'salons', salonId, 'queue');

  await runTransaction(db, async (transaction) => {
    // 1. Get current salon state for counters
    const salonDoc = await transaction.get(salonRef);
    if (!salonDoc.exists()) throw new Error("Salon not found");

    const salonData = salonDoc.data() as Salon;
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let newDailyCounter = salonData.dailyQueueCounter || 0;

    // 2. Check for daily reset
    if (salonData.lastResetDate !== todayStr) {
      newDailyCounter = 1; // Start fresh
    } else {
      newDailyCounter++;
    }

    // 3. Create Reference for new item
    const newItemRef = doc(queueCollectionRef);

    // 4. Set Queue Item
    transaction.set(newItemRef, {
      ...item,
      queueNumber: newDailyCounter,
      createdAt: Timestamp.now(),
    });

    // 5. Update Salon Counters
    transaction.update(salonRef, {
      dailyQueueCounter: newDailyCounter,
      lastResetDate: todayStr,
      queueCount: increment(1)
    });
  });
};

// [NEW] Find by Number
export const findActiveQueueItemByNumber = async (salonId: string, queueNumber: number): Promise<QueueItem | null> => {
  const queueRef = collection(db, 'salons', salonId, 'queue');
  const q = query(
    queueRef,
    where('queueNumber', '==', queueNumber),
    where('status', 'in', ['waiting', 'in_service'])
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as QueueItem;
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

// Helper to find reports or ratings
export const addRating = async (rating: Omit<Rating, 'id'>) => {
  const ratingsRef = collection(db, 'ratings');
  await setDoc(doc(ratingsRef), {
    ...rating,
    createdAt: Timestamp.now(),
  });
};

export const addReport = async (report: Omit<Report, 'id'>) => {
  const reportsRef = collection(db, 'reports');
  await setDoc(doc(reportsRef), {
    ...report,
    createdAt: Timestamp.now(),
  });
};

// Kiosk Helpers
export const findActiveQueueItemByPhone = async (salonId: string, phone: string): Promise<QueueItem | null> => {
  const queueRef = collection(db, 'salons', salonId, 'queue');
  // Check for waiting OR in_service
  const qWaiting = query(
    queueRef,
    where('userPhone', '==', phone),
    where('status', 'in', ['waiting', 'in_service'])
  );

  const snapshot = await getDocs(qWaiting);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as QueueItem;
};

export const checkOutQueueItem = async (salonId: string, itemId: string) => {
  const itemRef = doc(db, 'salons', salonId, 'queue', itemId);
  await updateDoc(itemRef, {
    status: 'completed',
    completedAt: Timestamp.now(),
  });

  // Decrement queue count
  const salonRef = doc(db, 'salons', salonId);
  await updateDoc(salonRef, {
    queueCount: increment(-1)
  });
};

// ============================================
// Feedback operations
// ============================================

export const submitFeedback = async (feedbackData: Omit<Feedback, 'id'>) => {
  const feedbackRef = collection(db, 'feedback');
  const docRef = await setDoc(doc(feedbackRef), {
    ...feedbackData,
    status: 'new',
    createdAt: Timestamp.now(),
  });
  return docRef;
};

export const getSalonFeedback = async (salonId: string): Promise<Feedback[]> => {
  const feedbackRef = collection(db, 'feedback');
  const q = query(
    feedbackRef,
    where('salonId', '==', salonId)
  );

  const snapshot = await getDocs(q);
  const feedbackList = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];

  // Sort client-side by createdAt descending
  return feedbackList.sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
};

export const subscribeToSalonFeedback = (
  salonId: string,
  callback: (feedback: Feedback[]) => void
) => {
  const feedbackRef = collection(db, 'feedback');
  const q = query(
    feedbackRef,
    where('salonId', '==', salonId)
  );

  return onSnapshot(q, (snapshot) => {
    const feedbackList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Feedback[];

    // Sort client-side
    const sorted = feedbackList.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    callback(sorted);
  });
};

export const updateFeedbackStatus = async (feedbackId: string, status: 'read' | 'resolved') => {
  const feedbackRef = doc(db, 'feedback', feedbackId);
  const updateData: any = { status };

  if (status === 'resolved') {
    updateData.resolvedAt = Timestamp.now();
  }

  await updateDoc(feedbackRef, updateData);
};
