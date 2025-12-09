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

// firebase/functions/src/rating.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const submitSalonRating = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { salonId, rating, review } = data;
  const userId = context.auth.uid;

  if (rating < 1 || rating > 5) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Rating must be between 1 and 5'
    );
  }

  try {
    // BR-5: Check if user has completed check-in at this salon
    const recentCheckIns = await db
      .collection('salons')
      .doc(salonId)
      .collection('queue')
      .where('userId', '==', userId)
      .where('status', '==', 'completed')
      .orderBy('completedAt', 'desc')
      .limit(1)
      .get();

    if (recentCheckIns.empty) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You must complete a visit before rating'
      );
    }

    const ratingRef = db.collection('ratings').doc();
    await ratingRef.set({
      salonId,
      userId,
      rating,
      review: review || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, ratingId: ratingRef.id };
  } catch (error: any) {
    console.error('Submit rating error:', error);
    throw error;
  }
});
