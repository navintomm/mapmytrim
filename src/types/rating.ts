export interface Rating {
  id: string;
  salonId: string;
  userId: string;
  rating: number; // 1-5
  review?: string;
  createdAt: Date;
}