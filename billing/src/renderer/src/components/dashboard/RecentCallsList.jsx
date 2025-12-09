import React, { useState, useEffect } from 'react';
import { PhoneIncoming, PhoneOutgoing, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function RecentCallsList() {
    const [calls, setCalls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRecentCalls();
        const interval = setInterval(loadRecentCalls, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    const loadRecentCalls = async () => {
        try {
            // Find recent 20 calls
            const result = await window.electron.db.find('cdrs', {
                selector: { timestamp: { $gt: null } },
                sort: [{ timestamp: 'desc' }],
                limit: 20
            });
            setCalls(result.docs || []);
        } catch (err) {
            console.error('Failed to load recent calls', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg"></div>)}
        </div>;
    }

    if (calls.length === 0) {
        return <div className="text-center text-gray-400 py-8">No recent activity</div>;
    }

    return (
        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
            {calls.map((call, idx) => (
                <div key={call._id || idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${call.type === 'incoming' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {call.type === 'incoming' ? <PhoneIncoming className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{call.dialedNumber || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                                <span className="font-mono mr-1">{call.extension}</span> • {call.time ? call.time.substring(0, 5) : '00:00'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">${(call.cost || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-end">
                            <Clock className="w-3 h-3 mr-1" />
                            {call.durationSeconds}s
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
