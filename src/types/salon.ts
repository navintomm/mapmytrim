export interface Salon {
  id: string;
  name: string;
  address: string;
  geoLocation: GeoLocation;
  contact: string;
  chairs: number;
  onDutyCount: number;
  queueCount: number;
  averageServiceTime: number; // in minutes
  createdAt: Date;
  distance?: number; // calculated field
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