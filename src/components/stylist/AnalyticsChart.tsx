import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartProps {
  data: { hour: number; count: number }[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  const formattedData = data.map((item) => ({
    time: `${item.hour}:00`,
    customers: item.count,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Customer Flow Today</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="customers" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};