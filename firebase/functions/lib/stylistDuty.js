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
exports.toggleStylistDuty = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.toggleStylistDuty = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { salonId, stylistId, isOnDuty } = data;
    try {
        const salonRef = db.collection('salons').doc(salonId);
        const stylistRef = salonRef.collection('stylists').doc(stylistId);
        const stylistDoc = await stylistRef.get();
        if (!stylistDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Stylist not found');
        }
        const currentStatus = ((_a = stylistDoc.data()) === null || _a === void 0 ? void 0 : _a.isOnDuty) || false;
        const batch = db.batch();
        batch.update(stylistRef, {
            isOnDuty,
            lastSeen: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update salon's on-duty count
        const increment = isOnDuty !== currentStatus ? (isOnDuty ? 1 : -1) : 0;
        if (increment !== 0) {
            batch.update(salonRef, {
                onDutyCount: admin.firestore.FieldValue.increment(increment),
            });
        }
        await batch.commit();
        return { success: true, isOnDuty };
    }
    catch (error) {
        console.error('Toggle duty error:', error);
        throw error;
    }
});
//# sourceMappingURL=stylistDuty.js.map