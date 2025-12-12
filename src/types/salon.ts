export interface Salon {
  id: string;
  ownerId: string;
  isApproved: boolean;
  name: string;
  address: string;
  timings?: {
    open: string;
    close: string;
    offDays: number[]; // 0 = Sunday
  };
  gstNumber?: string;
  businessLicenseNumber?: string;
  businessLicenseType?: 'trade_license' | 'gst' | 'shop_act' | 'other';
  ownerIdProof?: string; // Aadhaar/PAN
  licenseNumber?: string;
  geoLocation: GeoLocation;
  contact: string;
  chairs: number;
  onDutyCount: number;
  queueCount: number;
  averageServiceTime: number; // in minutes
  createdAt: Date;
  distance?: number; // calculated field
  dailyQueueCounter: number;
  lastResetDate: string; // YYYY-MM-DD
  acceptsBookings?: boolean;
  acceptsAppointments?: boolean;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface Stylist {
  id: string;
  name: string;
  isOnDuty: boolean;
  lastSeen: Date;
  photoURL?: string;
}

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  description?: string;
}

export interface Appointment {
  id: string;
  salonId: string;
  userId: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'booked' | 'completed' | 'cancelled';
  createdAt: any;
}