import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Calendar, TrendingUp, Phone, Clock, DollarSign, Database } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
    const { settings } = useSettings();
    const currency = settings.app?.currency || '$';
    const [range, setRange] = useState('week');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStats();
    }, [range]);

    const loadStats = async () => {
        setLoading(true);
        try {
            if (window.electron?.reports) {
                const data = await window.electron.reports.getStats(range);
                setStats(data);
            } else {
                console.warn('Electron API not available');
            }
        } catch (error) {
            console.error("Failed to load stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedData = async () => {
        if (!confirm('This will generate random test data. Continue?')) return;
        setLoading(true);
        try {
            if (window.electron?.db) {
                await window.electron.db.seed();
                await loadStats();
                alert('Mock data generated successfully!');
            }
        } catch (error) {
            console.error('Seed error:', error);
            alert('Failed to generate data');
        } finally {
            setLoading(false);
        }
    };

    if (!stats && loading) return <div className="p-8">Loading analytics...</div>;

    // Show empty state with seed button if no data
    if (!stats || stats.totals.calls === 0) {
        return (
            <div className="p-8 text-center space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">No Data Available</h2>
                <p className="text-gray-500">Generate mock data to test the analytics dashboard.</p>
                <button
                    onClick={handleSeedData}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                >
                    <Database className="w-4 h-4 mr-2" />
                    {loading ? 'Generating...' : 'Generate Mock Data'}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Statistical Overview</h1>
                    <p className="text-sm text-gray-500">Visual analysis of call traffic and costs</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleSeedData}
                        className="text-xs text-blue-500 hover:text-blue-700 underline flex items-center"
                    >
                        <Database className="w-3 h-3 mr-1" /> Generate Data
                    </button>
                    <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-200">
                        {['today', 'week', 'month'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${range === r
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Total Calls</div>
                        <div className="text-2xl font-bold">{stats.totals.calls}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Total Duration</div>
                        <div className="text-2xl font-bold">{(stats.totals.duration / 60).toFixed(0)} <span className="text-sm font-normal text-gray-400">mins</span></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Total Cost</div>
                        <div className="text-2xl font-bold">{currency}{stats.totals.cost.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Usage */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" /> Hourly Line Usage
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Cost */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" /> Cost Over Time
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.dailyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Extensions & Destinations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Top Spenders (Extensions)</h3>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="h-64 flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.extensionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="cost"
                                    >
                                        {stats.extensionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-64 pr-2">
                            {stats.extensionData.map((ext, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="font-medium">ext {ext.extension}</span>
                                    </div>
                                    <span className="font-bold">{currency}{ext.cost.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Top Destinations (Dialed)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.destinationData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="number" type="category" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} />
                                <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20}>
                                    {stats.destinationData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Department Usage */}
            {stats.departmentData?.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Department Cost Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.departmentData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="cost" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

        </div>
    );
}
