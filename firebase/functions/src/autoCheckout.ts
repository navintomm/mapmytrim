import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const AUTO_CHECKOUT_HOURS = 4;

export const autoCheckoutWorker = functions.pubsub
  .schedule('every 30 minutes')
  .onRun(async (context) => {
    const cutoffTime = admin.firestore.Timestamp.fromMillis(
      Date.now() - AUTO_CHECKOUT_HOURS * 60 * 60 * 1000
    );

    try {
      const salonsSnapshot = await db.collection('salons').get();

      for (const salonDoc of salonsSnapshot.docs) {
        const salonId = salonDoc.id;
        const queueSnapshot = await db
          .collection('salons')
          .doc(salonId)
          .collection('queue')
          .where('status', '==', 'waiting')
          .where('createdAt', '<', cutoffTime)
          .get();

        if (!queueSnapshot.empty) {
          const batch = db.batch();
          let count = 0;

          queueSnapshot.forEach((doc) => {
            batch.update(doc.ref, { status: 'completed' });
            count++;
          });

          const salonRef = db.collection('salons').doc(salonId);
          batch.update(salonRef, {
            queueCount: admin.firestore.FieldValue.increment(-count),
          });

          await batch.commit();
          console.log(`Auto-checked out ${count} customers from salon ${salonId}`);
        }
      }

      return null;
    } catch (error) {
      console.error('Auto-checkout error:', error);
      throw error;
    }
  });
