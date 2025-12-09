import React from 'react';
import { PhoneIncoming, User, PhoneCall, Clock } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        { label: 'Total Calls Today', value: '128', icon: PhoneCall, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Extensions', value: '45', icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Incoming Calls', value: '64', icon: PhoneIncoming, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Duration', value: '5h 12m', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <span className="text-sm text-gray-500">Last updated: Just now</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Recent Calls</h3>
                    <div className="text-gray-500 text-center py-10">
                        Chart Placeholder
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Live Activity</h3>
                    <div className="text-gray-500 text-center py-10">
                        List Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
}
