export interface Report {
    id: string;
    type: 'issue' | 'bug' | 'complaint' | 'other';
    description: string;
    salonId: string;
    reportedBy?: string; // phone number if available
    createdAt: Date;
}
