export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
  activeCheckIn?: ActiveCheckIn;
  createdAt: Date;
  loyaltyPoints?: number;
}
export interface ActiveCheckIn {
  shopId: string;
  checkInId: string;
  since: Date;
}