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
exports.createCheckIn = exports.onFeedbackCreate = exports.replyToFeedback = exports.onAppointmentUpdate = exports.onUserCreate = exports.onAppointmentCreate = exports.autoCheckoutWorker = exports.submitSalonRating = exports.adjustSalonQueue = exports.toggleStylistDuty = exports.checkoutCustomer = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
var checkout_1 = require("./checkout");
Object.defineProperty(exports, "checkoutCustomer", { enumerable: true, get: function () { return checkout_1.checkoutCustomer; } });
var stylistDuty_1 = require("./stylistDuty");
Object.defineProperty(exports, "toggleStylistDuty", { enumerable: true, get: function () { return stylistDuty_1.toggleStylistDuty; } });
var queueManagement_1 = require("./queueManagement");
Object.defineProperty(exports, "adjustSalonQueue", { enumerable: true, get: function () { return queueManagement_1.adjustSalonQueue; } });
var rating_1 = require("./rating");
Object.defineProperty(exports, "submitSalonRating", { enumerable: true, get: function () { return rating_1.submitSalonRating; } });
var autoCheckout_1 = require("./autoCheckout");
Object.defineProperty(exports, "autoCheckoutWorker", { enumerable: true, get: function () { return autoCheckout_1.autoCheckoutWorker; } });
var emailTriggers_1 = require("./triggers/emailTriggers");
Object.defineProperty(exports, "onAppointmentCreate", { enumerable: true, get: function () { return emailTriggers_1.onAppointmentCreate; } });
Object.defineProperty(exports, "onUserCreate", { enumerable: true, get: function () { return emailTriggers_1.onUserCreate; } });
Object.defineProperty(exports, "onAppointmentUpdate", { enumerable: true, get: function () { return emailTriggers_1.onAppointmentUpdate; } });
Object.defineProperty(exports, "replyToFeedback", { enumerable: true, get: function () { return emailTriggers_1.replyToFeedback; } });
var feedbackTriggers_1 = require("./triggers/feedbackTriggers");
Object.defineProperty(exports, "onFeedbackCreate", { enumerable: true, get: function () { return feedbackTriggers_1.onFeedbackCreate; } });
const db = admin.firestore();
const COOLDOWN_SECONDS = 20;
exports.createCheckIn = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { salonId } = data;
    const userId = context.auth.uid;
    try {
        // Check for active check-in (BR-1)
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        if (userData === null || userData === void 0 ? void 0 : userData.activeCheckIn) {
            throw new functions.https.HttpsError('failed-precondition', 'ERR_ACTIVE_CHECKIN: User already has an active check-in');
        }
        // Check cooldown (BR-2)
        const recentCheckIns = await db
            .collection('salons')
            .doc(salonId)
            .collection('queue')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        if (!recentCheckIns.empty) {
            const lastCheckIn = recentCheckIns.docs[0].data();
            const timeSinceLastCheckIn = Date.now() - lastCheckIn.createdAt.toMillis();
            if (timeSinceLastCheckIn < COOLDOWN_SECONDS * 1000) {
                throw new functions.https.HttpsError('failed-precondition', 'ERR_COOLDOWN: Please wait 20 seconds before checking in again');
            }
        }
        // Get salon data
        const salonRef = db.collection('salons').doc(salonId);
        const salonDoc = await salonRef.get();
        if (!salonDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Salon not found');
        }
        const salonData = salonDoc.data();
        const estimatedWaitTime = salonData.queueCount * (salonData.averageServiceTime || 15);
        // Create check-in atomically
        const checkInRef = salonRef.collection('queue').doc();
        const batch = db.batch();
        batch.set(checkInRef, {
            userId,
            status: 'waiting',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            estimatedWaitTime,
        });
        batch.update(salonRef, {
            queueCount: admin.firestore.FieldValue.increment(1),
        });
        batch.update(userRef, {
            activeCheckIn: {
                shopId: salonId,
                checkInId: checkInRef.id,
                since: admin.firestore.FieldValue.serverTimestamp(),
            },
        });
        await batch.commit();
        return {
            success: true,
            checkInId: checkInRef.id,
            queuePosition: salonData.queueCount + 1,
            estimatedWaitTime,
        };
    }
    catch (error) {
        console.error('Check-in error:', error);
        throw error;
    }
});
//# sourceMappingURL=index.js.map