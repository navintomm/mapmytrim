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
exports.onAppointmentCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const emailService_1 = require("../services/emailService");
const appointmentConfirmation_1 = require("../templates/appointmentConfirmation");
const db = admin.firestore();
exports.onAppointmentCreate = functions.firestore
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
        await (0, emailService_1.sendEmail)({
            to: userData.email,
            subject: `Appointment Confirmed at ${salonData.name} - MapMyTrim`,
            template: appointmentConfirmation_1.appointmentConfirmationTemplate,
            context: emailContext,
        });
        // 5. Update Appointment Document
        await snap.ref.update({
            confirmationEmailSent: true,
            emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Email sent successfully for appointment ${appointmentId}`);
    }
    catch (error) {
        console.error('Error sending confirmation email:', error);
        // We don't throw here to prevent infinite retries if the error is permanent
        // But for critical failures, you might want to rethrow or use a dead letter queue
    }
});
//# sourceMappingURL=emailTriggers.js.map