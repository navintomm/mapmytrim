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
