import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const toggleStylistDuty = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { salonId, stylistId, isOnDuty } = data;

  try {
    const salonRef = db.collection('salons').doc(salonId);
    const stylistRef = salonRef.collection('stylists').doc(stylistId);

    const stylistDoc = await stylistRef.get();
    if (!stylistDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Stylist not found');
    }

    const currentStatus = stylistDoc.data()?.isOnDuty || false;
    const batch = db.batch();

    batch.update(stylistRef, {
      isOnDuty,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update salon's on-duty count
    const increment = isOnDuty !== currentStatus ? (isOnDuty ? 1 : -1) : 0;
    if (increment !== 0) {
      batch.update(salonRef, {
        onDutyCount: admin.firestore.FieldValue.increment(increment),
      });
    }

    await batch.commit();

    return { success: true, isOnDuty };
  } catch (error: any) {
    console.error('Toggle duty error:', error);
    throw error;
  }
});
