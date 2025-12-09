import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const checkoutCustomer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { salonId, checkInId } = data;
  const userId = context.auth.uid;

  try {
    const salonRef = db.collection('salons').doc(salonId);
    const checkInRef = salonRef.collection('queue').doc(checkInId);
    const userRef = db.collection('users').doc(userId);

    const checkInDoc = await checkInRef.get();
    if (!checkInDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Check-in not found');
    }

    const checkInData = checkInDoc.data()!;
    if (checkInData.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized');
    }

    const batch = db.batch();

    batch.update(checkInRef, {
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const salonDoc = await salonRef.get();
    const currentQueue = salonDoc.data()?.queueCount || 0;

    // BR-3: Queue count cannot be negative
    batch.update(salonRef, {
      queueCount: Math.max(0, currentQueue - 1),
    });

    batch.update(userRef, {
      activeCheckIn: admin.firestore.FieldValue.delete(),
    });

    await batch.commit();

    return { success: true, message: 'Checked out successfully' };
  } catch (error: any) {
    console.error('Checkout error:', error);
    throw error;
  }
});
