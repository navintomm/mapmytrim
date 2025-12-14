'use client';

import React, { useMemo } from 'react';
import { Appointment } from '@/types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, DollarSign, Wallet } from 'lucide-react';

interface RevenueChartProps {
    appointments: Appointment[];
}

export function RevenueChart({ appointments }: RevenueChartProps) {
    // 1. Calculate Summary Stats
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let totalCompleted = 0;
        const today = new Date().toISOString().split('T')[0];
        let todayRevenue = 0;

        appointments.forEach(a => {
            if (a.status === 'completed') {
                // Use price field directly
                const effectivePrice = a.price || 0;

                totalRevenue += effectivePrice;
                totalCompleted++;

                if (a.date === today) {
                    todayRevenue += effectivePrice;
                }
            }
        });

        return { totalRevenue, totalCompleted, todayRevenue };
    }, [appointments]);

    // 2. Prepare Data for Bar Chart (Last 7 Days)
    const dailyData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const displayDate = d.toLocaleDateString(undefined, { weekday: 'short' });

            // Sum revenue for this day
            const dayRevenue = appointments
                .filter(a => a.status === 'completed' && a.date === dateStr)
                .reduce((sum, a) => sum + (a.price || 0), 0);

            data.push({ name: displayDate, revenue: dayRevenue });
        }
        return data;
    }, [appointments]);

    // 3. Prepare Data for Pie Chart (Revenue by Service)
    const serviceData = useMemo(() => {
        const map = new Map<string, number>();
        appointments
            .filter(a => a.status === 'completed')
            .forEach(a => {
                const price = a.price || 0;
                const current = map.get(a.serviceName) || 0;
                map.set(a.serviceName, current + price);
            });

        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [appointments]);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Revenue</p>
                        <h4 className="text-3xl font-black text-gray-900 mt-1">₹{stats.totalRevenue}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Wallet size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Today's Income</p>
                        <h4 className="text-3xl font-black text-gray-900 mt-1">₹{stats.todayRevenue}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <DollarSign size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Completed Services</p>
                        <h4 className="text-3xl font-black text-gray-900 mt-1">{stats.totalCompleted}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Weekly Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="revenue" fill="#8884d8" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue by Service</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie
                                data={serviceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
