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
exports.submitSalonRating = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.submitSalonRating = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { salonId, rating, review } = data;
    const userId = context.auth.uid;
    if (rating < 1 || rating > 5) {
        throw new functions.https.HttpsError('invalid-argument', 'Rating must be between 1 and 5');
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
            throw new functions.https.HttpsError('failed-precondition', 'You must complete a visit before rating');
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
    }
    catch (error) {
        console.error('Submit rating error:', error);
        throw error;
    }
});
//# sourceMappingURL=rating.js.map