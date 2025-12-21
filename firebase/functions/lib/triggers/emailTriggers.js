"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyToFeedback = exports.onAppointmentUpdate = exports.onUserCreate = exports.onAppointmentCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const emailService_1 = require("../services/emailService");
const appointmentConfirmation_1 = require("../templates/appointmentConfirmation");
const welcomeUser_1 = require("../templates/welcomeUser");
const welcomeStylist_1 = require("../templates/welcomeStylist");
const appointmentCancelled_1 = require("../templates/appointmentCancelled");
const feedbackReply_1 = require("../templates/feedbackReply");
const db = admin.firestore();
exports.onAppointmentCreate = functions.firestore
    .document('appointments/{appointmentId}')
    .onCreate(async (snap, context) => {
    const appointmentData = snap.data();
    const appointmentId = context.params.appointmentId;
    console.log(`New appointment created: ${appointmentId}, status: ${appointmentData === null || appointmentData === void 0 ? void 0 : appointmentData.status}`);
    if (!appointmentData)
        return;
    // Send confirmation email immediately for 'booked' status
    await sendAppointmentConfirmation(appointmentId, appointmentData);
});
exports.onUserCreate = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
    const userData = snap.data();
    const userId = context.params.userId;
    console.log(`New user created: ${userId}, role: ${userData === null || userData === void 0 ? void 0 : userData.role}`);
    if (!userData || !userData.email) {
        console.log('No email found for new user.');
        return;
    }
    try {
        const isOwner = userData.role === 'owner';
        const template = isOwner ? welcomeStylist_1.welcomeStylistTemplate : welcomeUser_1.welcomeUserTemplate;
        const subject = isOwner ? 'Welcome to MapMyTrim Partner! 💈' : 'Welcome to MapMyTrim! ✂️';
        const dashboardLink = 'https://mapmytrim.web.app/salon/dashboard'; // Update with prod URL
        const appLink = 'https://mapmytrim.web.app/home';
        await (0, emailService_1.sendEmail)({
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
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
    }
});
exports.onAppointmentUpdate = functions.firestore
    .document('appointments/{appointmentId}')
    .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const appointmentId = context.params.appointmentId;
    // Check if status changed to 'confirmed' (or 'booked' if we treat that as confirmed)
    // We will treat 'pending' -> 'confirmed' (or 'booked') as the confirmation event.
    // Assuming 'confirmed' is the target status for accepted appointments.
    const isConfirmed = (newData.status === 'confirmed' || newData.status === 'booked') &&
        (previousData.status === 'pending');
    if (isConfirmed) {
        console.log(`Appointment ${appointmentId} confirmed. Sending notification.`);
        await sendAppointmentConfirmation(appointmentId, newData);
    }
    // Check if status changed to 'cancelled'
    if (newData.status === 'cancelled' && previousData.status !== 'cancelled') {
        console.log(`Appointment ${appointmentId} cancelled. Sending notification.`);
        try {
            // Fetch User
            const userDoc = await db.collection('users').doc(newData.userId).get();
            const userData = userDoc.data();
            if (!(userData === null || userData === void 0 ? void 0 : userData.email))
                return;
            // Fetch Salon
            const salonDoc = await db.collection('salons').doc(newData.salonId).get();
            const salonData = salonDoc.data();
            const salonName = (salonData === null || salonData === void 0 ? void 0 : salonData.name) || 'Salon';
            await (0, emailService_1.sendEmail)({
                to: userData.email,
                subject: `Appointment Cancelled - ${salonName}`,
                template: appointmentCancelled_1.appointmentCancelledTemplate,
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
        }
        catch (error) {
            console.error('Error sending cancellation email:', error);
        }
    }
});
// Helper to send confirmation
async function sendAppointmentConfirmation(appointmentId, appointmentData) {
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
            appLink: 'https://mapmytrim.web.app/appointments',
            calendarLink: '#',
        };
        // 4. Send Email
        await (0, emailService_1.sendEmail)({
            to: userData.email,
            subject: `Appointment Confirmed at ${salonData.name} - MapMyTrim`,
            template: appointmentConfirmation_1.appointmentConfirmationTemplate,
            context: emailContext,
        });
        // 5. Update Appointment Document (optional: prevent double send)
        // In clean architecture, we might check confirmationEmailSent flag first
        if (!appointmentData.confirmationEmailSent) {
            await db.collection('appointments').doc(appointmentId).update({
                confirmationEmailSent: true,
                emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        console.log(`Email sent successfully for appointment ${appointmentId}`);
    }
    catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}
exports.replyToFeedback = functions.https.onCall(async (data, context) => {
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
        if (!(feedbackData === null || feedbackData === void 0 ? void 0 : feedbackData.userEmail)) {
            throw new functions.https.HttpsError('failed-precondition', 'Feedback has no user email.');
        }
        await (0, emailService_1.sendEmail)({
            to: feedbackData.userEmail,
            subject: `Reply to your feedback - ${feedbackData.salonName}`,
            template: feedbackReply_1.feedbackReplyTemplate,
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
    }
    catch (error) {
        console.error('Error replying to feedback:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send reply.');
    }
});
//# sourceMappingURL=emailTriggers.js.map