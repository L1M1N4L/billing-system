import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function DashboardCharts({ stats, isLoading }) {
    if (isLoading) {
        return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
    }

    const { hourlyData, extensionData } = stats || { hourlyData: [], extensionData: [] };

    // Placeholder data if empty
    const chartData = hourlyData?.length > 0 ? hourlyData : [
        { hour: '08:00', calls: 12 }, { hour: '09:00', calls: 19 },
        { hour: '10:00', calls: 35 }, { hour: '11:00', calls: 24 },
        { hour: '12:00', calls: 10 }, { hour: '13:00', calls: 32 },
        { hour: '14:00', calls: 28 }, { hour: '15:00', calls: 22 }
    ];

    return (
        <div className="space-y-6">
            <div className="h-64">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Call Volume (Today)</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {extensionData && extensionData.length > 0 && (
                <div className="h-64 border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">Top Extensions by Cost</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={extensionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="extension" type="category" width={40} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip cursor={{ fill: '#f9fafb' }} />
                            <Bar dataKey="cost" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
