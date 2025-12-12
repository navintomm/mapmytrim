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
exports.onFeedbackCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const emailService_1 = require("../services/emailService");
exports.onFeedbackCreate = functions.firestore
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
        const ownerId = salonData === null || salonData === void 0 ? void 0 : salonData.ownerId;
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
        const ownerEmail = ownerData === null || ownerData === void 0 ? void 0 : ownerData.email;
        if (!ownerEmail) {
            console.error('Owner has no email address');
            return;
        }
        console.log(`Sending feedback notification to: ${ownerEmail}`);
        // Send email
        const feedbackTypeLabels = {
            suggestion: 'Suggestion',
            feedback: 'Feedback',
            complaint: 'Complaint',
        };
        await (0, emailService_1.sendFeedbackNotificationEmail)(ownerEmail, {
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
    }
    catch (error) {
        console.error('Error sending feedback notification:', error);
        throw error;
    }
});
//# sourceMappingURL=feedbackTriggers.js.map