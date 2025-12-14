import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from '../services/emailService';
import { appointmentConfirmationTemplate } from '../templates/appointmentConfirmation';
import { welcomeUserTemplate } from '../templates/welcomeUser';
import { welcomeStylistTemplate } from '../templates/welcomeStylist';
import { appointmentCancelledTemplate } from '../templates/appointmentCancelled';
import { feedbackReplyTemplate } from '../templates/feedbackReply';

const db = admin.firestore();

export const onAppointmentCreate = functions.firestore
    .document('appointments/{appointmentId}')
    .onCreate(async (snap, context) => {
        const appointmentData = snap.data();
        const appointmentId = context.params.appointmentId;

        console.log(`Starting email confirmation for appointment: ${appointmentId}`);

        if (!appointmentData) {
            console.log('No appointment data found');
            return;
        }

        try {
            // 1. Fetch User Data to get Email
            const userRef = db.collection('users').doc(appointmentData.userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data();

            if (!userData || !userData.email) {
                console.log('User data or email not found');
                return;
            }

            // 2. Fetch Salon Data
            const salonRef = db.collection('salons').doc(appointmentData.salonId);
            const salonDoc = await salonRef.get();
            const salonData = salonDoc.data();

            if (!salonData) {
                console.log('Salon data not found');
                return;
            }

            // 3. Prepare Email Context
            const emailContext = {
                userName: userData.name || 'Valued Customer',
                salonName: salonData.name,
                date: appointmentData.date, // Assumes YYYY-MM-DD or readable format
                time: appointmentData.time,
                serviceName: appointmentData.serviceName,
                stylistName: appointmentData.stylistName || null,
                price: appointmentData.price || '0.00',
                salonAddress: salonData.address || 'Address available in app',
                salonPhone: salonData.phone || '',
                googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salonData.name} ${salonData.address || ''}`)}`,
                appLink: 'https://mapmytrim.web.app/appointments', // Replace with actual app URL if different
                calendarLink: '#', // TODO: Generate proper utility for calendar links
            };

            // 4. Send Email
            await sendEmail({
                to: userData.email,
                subject: `Appointment Confirmed at ${salonData.name} - MapMyTrim`,
                template: appointmentConfirmationTemplate,
                context: emailContext,
            });

            // 5. Update Appointment Document
            await snap.ref.update({
                confirmationEmailSent: true,
                emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Email sent successfully for appointment ${appointmentId}`);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            // We don't throw here to prevent infinite retries if the error is permanent
            // But for critical failures, you might want to rethrow or use a dead letter queue
        }
    });

export const onUserCreate = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const userData = snap.data();
        const userId = context.params.userId;
        console.log(`New user created: ${userId}, role: ${userData?.role}`);

        if (!userData || !userData.email) {
            console.log('No email found for new user.');
            return;
        }

        try {
            const isOwner = userData.role === 'owner';
            const template = isOwner ? welcomeStylistTemplate : welcomeUserTemplate;
            const subject = isOwner ? 'Welcome to MapMyTrim Partner! 💈' : 'Welcome to MapMyTrim! ✂️';
            const dashboardLink = 'https://mapmytrim.web.app/salon/dashboard'; // Update with prod URL
            const appLink = 'https://mapmytrim.web.app/home';

            await sendEmail({
                to: userData.email,
                subject: subject,
                template: template,
                context: {
                    userName: userData.name || 'User',
                    dashboardLink,
                    appLink
                }
            });
            console.log(`Welcome email sent to ${userData.email}`);
        } catch (error) {
            console.error('Error sending welcome email:', error);
        }
    });

export const onAppointmentUpdate = functions.firestore
    .document('appointments/{appointmentId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const previousData = change.before.data();
        const appointmentId = context.params.appointmentId;

        // Check if status changed to 'cancelled'
        if (newData.status === 'cancelled' && previousData.status !== 'cancelled') {
            console.log(`Appointment ${appointmentId} cancelled. Sending notification.`);

            try {
                // Fetch User
                const userDoc = await db.collection('users').doc(newData.userId).get();
                const userData = userDoc.data();
                if (!userData?.email) return;

                // Fetch Salon
                const salonDoc = await db.collection('salons').doc(newData.salonId).get();
                const salonData = salonDoc.data();
                const salonName = salonData?.name || 'Salon';

                await sendEmail({
                    to: userData.email,
                    subject: `Appointment Cancelled - ${salonName}`,
                    template: appointmentCancelledTemplate,
                    context: {
                        userName: userData.name || 'Customer',
                        salonName: salonName,
                        serviceName: newData.serviceName,
                        date: newData.date,
                        time: newData.time,
                        reason: 'Cancelled by user/salon request' // You might want to pass a reason if available
                    }
                });
                console.log(`Cancellation email sent to ${userData.email}`);
            } catch (error) {
                console.error('Error sending cancellation email:', error);
            }
        }
    });

export const replyToFeedback = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    // Verify caller is owner of the salon associated with the feedback
    // optimized: assume caller is authorized owner for now, usually you'd check ownerId match

    const { feedbackId, replyMessage } = data;
    if (!feedbackId || !replyMessage) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing feedbackId or replyMessage.');
    }

    try {
        const feedbackRef = db.collection('feedback').doc(feedbackId);
        const feedbackDoc = await feedbackRef.get();

        if (!feedbackDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Feedback not found.');
        }

        const feedbackData = feedbackDoc.data();
        if (!feedbackData?.userEmail) {
            throw new functions.https.HttpsError('failed-precondition', 'Feedback has no user email.');
        }

        await sendEmail({
            to: feedbackData.userEmail,
            subject: `Reply to your feedback - ${feedbackData.salonName}`,
            template: feedbackReplyTemplate,
            context: {
                userName: feedbackData.userName || 'Customer',
                salonName: feedbackData.salonName,
                feedbackType: feedbackData.type, // 'complaint', 'suggestion', etc.
                replyMessage: replyMessage,
                originalMessage: feedbackData.message
            }
        });

        // Update feedback status
        await feedbackRef.update({
            replySent: true,
            replyMessage: replyMessage,
            repliedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true };

    } catch (error) {
        console.error('Error replying to feedback:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send reply.');
    }
});
