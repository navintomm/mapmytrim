import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendFeedbackNotificationEmail } from '../services/emailService';

export const onFeedbackCreate = functions.firestore
    .document('feedback/{feedbackId}')
    .onCreate(async (snap, context) => {
        const feedback = snap.data();
        const feedbackId = context.params.feedbackId;

        console.log(`New feedback received: ${feedbackId}`);
        console.log('Feedback data:', feedback);

        try {
            // Fetch salon data to get owner information
            const salonDoc = await admin.firestore()
                .collection('salons')
                .doc(feedback.salonId)
                .get();

            if (!salonDoc.exists) {
                console.error(`Salon not found: ${feedback.salonId}`);
                return;
            }

            const salonData = salonDoc.data();
            const ownerId = salonData?.ownerId;

            if (!ownerId) {
                console.error('Salon has no owner ID');
                return;
            }

            // Fetch owner's user document to get email
            const ownerDoc = await admin.firestore()
                .collection('users')
                .doc(ownerId)
                .get();

            if (!ownerDoc.exists) {
                console.error(`Owner not found: ${ownerId}`);
                return;
            }

            const ownerData = ownerDoc.data();
            const ownerEmail = ownerData?.email;

            if (!ownerEmail) {
                console.error('Owner has no email address');
                return;
            }

            console.log(`Sending feedback notification to: ${ownerEmail}`);

            // Send email
            const feedbackTypeLabels: Record<string, string> = {
                suggestion: 'Suggestion',
                feedback: 'Feedback',
                complaint: 'Complaint',
            };

            await sendFeedbackNotificationEmail(ownerEmail, {
                salonName: feedback.salonName,
                userName: feedback.userName,
                userEmail: feedback.userEmail,
                feedbackType: feedback.type,
                feedbackTypeLabel: feedbackTypeLabels[feedback.type] || 'Feedback',
                subject: feedback.subject,
                message: feedback.message,
                dashboardLink: `https://mapmytrim.com/salon/dashboard/feedback`, // Update with actual domain
            });

            // Update feedback document with email sent timestamp
            await snap.ref.update({
                emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log('Feedback notification email sent successfully');
        } catch (error) {
            console.error('Error sending feedback notification:', error);
            throw error;
        }
    });
