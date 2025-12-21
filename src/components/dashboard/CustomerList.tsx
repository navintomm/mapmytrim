'use client';

import React, { useState, useMemo } from 'react';
import { Appointment } from '@/types';
import { Search, Phone, Calendar, User } from 'lucide-react';

interface CustomerListProps {
    appointments: Appointment[];
}

interface CustomerStats {
    userId: string;
    name: string;
    phone?: string; // Not currently in Appointment type, but good to have if we fetch user
    lastVisit: Date;
    totalVisits: number;
    totalSpent: number;
}

export function CustomerList({ appointments }: CustomerListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Process appointments to find unique customers
    const customers = useMemo(() => {
        const customerMap = new Map<string, CustomerStats>();

        appointments.forEach(appt => {
            // Skip if cancelled? Maybe show them still. Let's show everyone.

            const existing = customerMap.get(appt.userId);
            const apptDate = new Date(`${appt.date}T${appt.time}`);
            const spent = appt.price || 0;

            if (!existing) {
                customerMap.set(appt.userId, {
                    userId: appt.userId,
                    name: appt.userName,
                    lastVisit: apptDate,
                    totalVisits: 1,
                    totalSpent: spent
                });
            } else {
                existing.totalVisits += 1;
                existing.totalSpent += spent;
                if (apptDate > existing.lastVisit) {
                    existing.lastVisit = apptDate;
                }
            }
        });

        return Array.from(customerMap.values())
            .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime()); // Most recent first
    }, [appointments]);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <User size={20} className="text-teal-500" /> Client List
                </h3>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                            <th className="py-3 pl-4">Client Name</th>
                            <th className="py-3">Visits</th>
                            <th className="py-3">Last Visit</th>
                            <th className="py-3">Total Value</th>
                            <th className="py-3 pr-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.userId} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{customer.name}</div>
                                                <div className="text-xs text-gray-400">ID: {customer.userId.slice(0, 6)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {customer.totalVisits}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} className="text-gray-400" />
                                            {customer.lastVisit.toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-4 font-medium text-gray-900">
                                        ₹{customer.totalSpent}
                                    </td>
                                    <td className="py-4 pr-4">
                                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                                            View History
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                                    No clients found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
