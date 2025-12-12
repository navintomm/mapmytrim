import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const adjustSalonQueue = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { salonId, adjustment } = data; // adjustment: 1 or -1

  try {
    const salonRef = db.collection('salons').doc(salonId);
    const salonDoc = await salonRef.get();

    if (!salonDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Salon not found');
    }

    const currentQueue = salonDoc.data()?.queueCount || 0;
    const newQueue = currentQueue + adjustment;

    // BR-3: Queue count cannot be negative
    if (newQueue < 0) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'ERR_QUEUE_NEGATIVE: Queue count cannot be negative'
      );
    }

    await salonRef.update({
      queueCount: newQueue,
    });

    return { success: true, queueCount: newQueue };
  } catch (error: any) {
    console.error('Adjust queue error:', error);
    throw error;
  }
});

