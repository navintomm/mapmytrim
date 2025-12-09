export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  activeCheckIn?: ActiveCheckIn;
  createdAt: Date;
}
export interface ActiveCheckIn {
  shopId: string;
  checkInId: string;
  since: Date;
}