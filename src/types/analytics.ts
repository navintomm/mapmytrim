export interface SalonAnalytics {
  salonId: string;
  date: string;
  peakHour: number;
  avgWaitTime: number;
  crowdFlowData: CrowdFlowData[];
  totalCustomers: number;
}

export interface CrowdFlowData {
  hour: number;
  count: number;
}