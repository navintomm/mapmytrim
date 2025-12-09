export const calculatePeakHour = (crowdData: { hour: number; count: number }[]): number => {
  if (!crowdData.length) return 12; // Default to noon
  return crowdData.reduce((max, item) => 
    item.count > (crowdData.find(d => d.hour === max)?.count || 0) ? item.hour : max
  , crowdData[0].hour);
};

export const calculateAverageWaitTime = (waitTimes: number[]): number => {
  if (!waitTimes.length) return 0;
  return waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length;
};

export const generateCrowdFlowData = (): { hour: number; count: number }[] => {
  // Generate mock data for 24 hours
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 30),
  }));
};