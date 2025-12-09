import React, { useState, useEffect } from 'react';
import { PhoneIncoming, User, PhoneCall, Clock } from 'lucide-react';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import RecentCallsList from '../components/dashboard/RecentCallsList';

export default function Dashboard() {
    const [stats, setStats] = useState({
        calls: 0,
        activeExtensions: 0,
        incoming: 0,
        duration: 0,
        hourlyData: [],
        extensionData: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setIsLoading(true);
        try {
            const data = await window.electron.reports.getStats('today');
            setStats({
                calls: data.totals.calls,
                duration: Math.round(data.totals.duration / 60), // mins
                activeExtensions: data.extensionData.length, // rough proxy
                incoming: 0, // Not provided by current generator
                hourlyData: data.hourlyData,
                extensionData: data.extensionData
            });
        } catch (err) {
            console.error('Failed to load dashboard stats', err);
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Calls Today', value: stats.calls, icon: PhoneCall, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Top Extensions', value: stats.activeExtensions, icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Duration (min)', value: stats.duration, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <span className="text-sm text-gray-500">Overview for Today</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => (
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
                    <h3 className="font-semibold text-gray-800 mb-6">Call Analytics</h3>
                    <DashboardCharts stats={stats} isLoading={isLoading} />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                    <h3 className="font-semibold text-gray-800 mb-4">Live Activity</h3>
                    <RecentCallsList />
                </div>
            </div>
        </div>
    );
}
