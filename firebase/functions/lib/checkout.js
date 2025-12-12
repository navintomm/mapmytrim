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
exports.checkoutCustomer = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.checkoutCustomer = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { salonId, checkInId } = data;
    const userId = context.auth.uid;
    try {
        const salonRef = db.collection('salons').doc(salonId);
        const checkInRef = salonRef.collection('queue').doc(checkInId);
        const userRef = db.collection('users').doc(userId);
        const checkInDoc = await checkInRef.get();
        if (!checkInDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Check-in not found');
        }
        const checkInData = checkInDoc.data();
        if (checkInData.userId !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Unauthorized');
        }
        const batch = db.batch();
        batch.update(checkInRef, {
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        const salonDoc = await salonRef.get();
        const currentQueue = ((_a = salonDoc.data()) === null || _a === void 0 ? void 0 : _a.queueCount) || 0;
        // BR-3: Queue count cannot be negative
        batch.update(salonRef, {
            queueCount: Math.max(0, currentQueue - 1),
        });
        batch.update(userRef, {
            activeCheckIn: admin.firestore.FieldValue.delete(),
        });
        await batch.commit();
        return { success: true, message: 'Checked out successfully' };
    }
    catch (error) {
        console.error('Checkout error:', error);
        throw error;
    }
});
//# sourceMappingURL=checkout.js.map