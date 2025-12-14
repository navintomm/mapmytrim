export type FeedbackType = 'suggestion' | 'feedback' | 'complaint';
export type FeedbackStatus = 'new' | 'read' | 'resolved';

export interface Feedback {
    id: string;
    salonId: string;
    salonName: string;
    userId: string;
    userName: string;
    userEmail: string;
    type: FeedbackType;
    subject: string;
    message: string;
    status: FeedbackStatus;
    createdAt: any; // Firestore Timestamp
    emailSentAt?: any; // Firestore Timestamp
    resolvedAt?: any; // Firestore Timestamp
    replySent?: boolean;
    replyMessage?: string;
    repliedAt?: any; // Timestamp
}
