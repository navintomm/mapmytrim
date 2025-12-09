import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export { createCheckIn } from './checkIn';
export { checkoutCustomer } from './checkout';
export { toggleStylistDuty } from './stylistDuty';
export { adjustSalonQueue } from './queueManagement';
export { submitSalonRating } from './rating';
export { autoCheckoutWorker } from './autoCheckout';

// firebase/functions/src/checkIn.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const COOLDOWN_SECONDS = 20;

export const createCheckIn = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { salonId } = data;
  const userId = context.auth.uid;

  try {
    // Check for active check-in (BR-1)
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (userData?.activeCheckIn) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'ERR_ACTIVE_CHECKIN: User already has an active check-in'
      );
    }

    // Check cooldown (BR-2)
    const recentCheckIns = await db
      .collection('salons')
      .doc(salonId)
      .collection('queue')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (!recentCheckIns.empty) {
      const lastCheckIn = recentCheckIns.docs[0].data();
      const timeSinceLastCheckIn =
        Date.now() - lastCheckIn.createdAt.toMillis();
      if (timeSinceLastCheckIn < COOLDOWN_SECONDS * 1000) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'ERR_COOLDOWN: Please wait 20 seconds before checking in again'
        );
      }
    }

    // Get salon data
    const salonRef = db.collection('salons').doc(salonId);
    const salonDoc = await salonRef.get();
    if (!salonDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Salon not found');
    }

    const salonData = salonDoc.data()!;
    const estimatedWaitTime =
      salonData.queueCount * (salonData.averageServiceTime || 15);

    // Create check-in atomically
    const checkInRef = salonRef.collection('queue').doc();
    const batch = db.batch();

    batch.set(checkInRef, {
      userId,
      status: 'waiting',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      estimatedWaitTime,
    });

    batch.update(salonRef, {
      queueCount: admin.firestore.FieldValue.increment(1),
    });

    batch.update(userRef, {
      activeCheckIn: {
        shopId: salonId,
        checkInId: checkInRef.id,
        since: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    await batch.commit();

    return {
      success: true,
      checkInId: checkInRef.id,
      queuePosition: salonData.queueCount + 1,
      estimatedWaitTime,
    };
  } catch (error: any) {
    console.error('Check-in error:', error);
    throw error;
  }
});
