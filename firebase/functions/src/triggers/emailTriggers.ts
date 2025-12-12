import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from '../services/emailService';
import { appointmentConfirmationTemplate } from '../templates/appointmentConfirmation';

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
