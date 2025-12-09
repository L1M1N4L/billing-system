import React, { useState, useEffect } from 'react';
import { Save, Server, Bell, Shield, Database, Monitor } from 'lucide-react';
import Button from '../../components/common/Button';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('smdr');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        smdr: {
            mode: 'server', // server, client
            port: 3000,
            host: '0.0.0.0', // or PABX IP if client
            protocol: 'standard'
        },
        alarms: {
            enabled: false,
            email: '',
            timeout: 300 // seconds
        },
        app: {
            currency: '$',
            defaultRate: 0,
            dateFormat: 'YYYY-MM-DD',
            theme: 'light'
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        // Load each section
        const smdr = await window.electron.settings.get('smdr') || settings.smdr;
        const alarms = await window.electron.settings.get('alarms') || settings.alarms;
        const app = await window.electron.settings.get('app') || settings.app;
        setSettings({ smdr, alarms, app });
    };

    const handleChange = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await window.electron.settings.set('smdr', settings.smdr);
            await window.electron.settings.set('alarms', settings.alarms);
            await window.electron.settings.set('app', settings.app);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    const renderSMDRSettings = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Communication Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Connection Mode</label>
                    <select
                        value={settings.smdr.mode}
                        onChange={(e) => handleChange('smdr', 'mode', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    >
                        <option value="server">TCP Server (Listen)</option>
                        <option value="client">TCP Client (Connect to PABX)</option>
                        <option value="serial">Serial Port (RS232)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Server: The app waits for PABX to connect. Client: The app connects to PABX IP.
                    </p>
                </div>

                {settings.smdr.mode === 'client' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">PABX IP Address</label>
                        <input
                            type="text"
                            value={settings.smdr.host}
                            onChange={(e) => handleChange('smdr', 'host', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="192.168.1.10"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {settings.smdr.mode === 'serial' ? 'Baud Rate' : 'Port Number'}
                    </label>
                    <input
                        type="number"
                        value={settings.smdr.port}
                        onChange={(e) => handleChange('smdr', 'port', parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        placeholder="3000"
                    />
                </div>
            </div>
        </div>
    );

    const renderAlarmSettings = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">SMDR Alarm System</h3>
            <div className="flex items-center space-x-2 mb-4">
                <input
                    type="checkbox"
                    checked={settings.alarms.enabled}
                    onChange={(e) => handleChange('alarms', 'enabled', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label className="text-sm font-medium text-gray-700">Enable "No Data" Alarm</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Alert Email Address</label>
                    <input
                        type="email"
                        value={settings.alarms.email}
                        onChange={(e) => handleChange('alarms', 'email', e.target.value)}
                        disabled={!settings.alarms.enabled}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 disabled:bg-gray-100"
                        placeholder="admin@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Timeout (Seconds)</label>
                    <input
                        type="number"
                        value={settings.alarms.timeout}
                        onChange={(e) => handleChange('alarms', 'timeout', parseInt(e.target.value))}
                        disabled={!settings.alarms.enabled}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 disabled:bg-gray-100"
                        placeholder="300"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert if no data received for this duration.</p>
                </div>
            </div>
        </div>
    );

    const renderAppSettings = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Application Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Currency Symbol</label>
                    <input
                        type="text"
                        value={settings.app.currency}
                        onChange={(e) => handleChange('app', 'currency', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        placeholder="$"
                        maxLength={3}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Rate</label>
                    <input
                        type="number"
                        value={settings.app.defaultRate}
                        onChange={(e) => handleChange('app', 'defaultRate', parseFloat(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        placeholder="0.00"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date Format</label>
                    <select
                        value={settings.app.dateFormat}
                        onChange={(e) => handleChange('app', 'dateFormat', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Theme</label>
                    <select
                        value={settings.app.theme}
                        onChange={(e) => handleChange('app', 'theme', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Parameters</h1>
                    <p className="text-sm text-gray-500">Configure SMDR, Alarms, and General Settings</p>
                </div>
                <Button onClick={handleSave} icon={Save} isLoading={loading}>
                    Save Changes
                </Button>
            </div>

            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('smdr')}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'smdr' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Server className="w-4 h-4 mr-2" />
                    Communication (SMDR)
                </button>
                <button
                    onClick={() => setActiveTab('alarms')}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'alarms' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Bell className="w-4 h-4 mr-2" />
                    Alarms
                </button>
                <button
                    onClick={() => setActiveTab('app')}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'app' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Monitor className="w-4 h-4 mr-2" />
                    General
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                {activeTab === 'smdr' && renderSMDRSettings()}
                {activeTab === 'alarms' && renderAlarmSettings()}
                {activeTab === 'app' && renderAppSettings()}
            </div>
        </div>
    );
}