import React, { useState, useEffect } from 'react';
import { Save, Server, Bell, Monitor } from 'lucide-react';
import Button from '../../components/common/Button';
import { useSettings } from '../../context/SettingsContext';

export default function SettingsPage() {
    const { settings: globalSettings, updateSettings } = useSettings();
    const [activeTab, setActiveTab] = useState('smdr');
    const [loading, setLoading] = useState(false);
    const [smdrStatus, setSmdrStatus] = useState({ running: false, connected: false });

    // Local state for editing form
    const [formSettings, setFormSettings] = useState({
        smdr: { mode: 'server', port: 3000, host: '0.0.0.0' },
        alarms: { enabled: false, email: '', timeout: 300 },
        app: { currency: '$', defaultRate: 0, theme: 'light', dateFormat: 'YYYY-MM-DD' }
    });

    useEffect(() => {
        if (globalSettings) {
            setFormSettings(prev => ({
                smdr: { ...prev.smdr, ...globalSettings.smdr },
                alarms: { ...prev.alarms, ...globalSettings.alarms },
                app: { ...prev.app, ...globalSettings.app }
            }));
        }
    }, [globalSettings]);

    useEffect(() => {
        // Initial status fetch
        if (window.electron?.smdr) {
            window.electron.smdr.getStatus().then(setSmdrStatus);
        }

        // Listen for updates
        const removeListener = window.electron?.ipcRenderer?.on('smdr:status-change', (status) => {
            setSmdrStatus(prev => ({ ...prev, ...status }));
        });

        return () => {
            if (removeListener) removeListener();
        };
    }, []);

    const handleStartSMDR = async () => {
        try {
            await window.electron.smdr.start(formSettings.smdr);
            // Status will update automatically via listener
        } catch (error) {
            console.error('Failed to start SMDR:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to start SMDR service: ${errorMessage}`);
        }
    };

    const handleStopSMDR = async () => {
        try {
            await window.electron.smdr.stop();
        } catch (error) {
            console.error('Failed to stop SMDR:', error);
        }
    };

    const handleChange = (section, key, value) => {
        setFormSettings(prev => ({
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
            const settingsToSave = {
                smdr: {
                    ...formSettings.smdr,
                    port: parseInt(formSettings.smdr.port) || 3000
                },
                alarms: {
                    ...formSettings.alarms,
                    timeout: parseInt(formSettings.alarms.timeout) || 300
                },
                app: {
                    ...formSettings.app,
                    defaultRate: parseFloat(formSettings.app.defaultRate) || 0
                }
            };

            await updateSettings('smdr', settingsToSave.smdr);
            await updateSettings('alarms', settingsToSave.alarms);
            await updateSettings('app', settingsToSave.app);
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
            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-medium text-gray-900">Communication Parameters</h3>
                <div className="flex items-center space-x-2">
                    <span className={`flex h-3 w-3 rounded-full ${smdrStatus.connected ? 'bg-green-500' : (smdrStatus.running ? 'bg-orange-400' : 'bg-gray-300')}`}></span>
                    <span className="text-sm font-medium text-gray-600">
                        {smdrStatus.connected ? 'Connected' : (smdrStatus.running ? 'Listening' : 'Stopped')}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Connection Mode</label>
                    <select
                        value={formSettings.smdr.mode}
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

                {formSettings.smdr.mode === 'client' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">PABX IP Address</label>
                        <input
                            type="text"
                            value={formSettings.smdr.host}
                            onChange={(e) => handleChange('smdr', 'host', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="192.168.1.10"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {formSettings.smdr.mode === 'serial' ? 'Baud Rate' : 'Port Number'}
                    </label>
                    <input
                        type="number"
                        value={formSettings.smdr.port}
                        onChange={(e) => handleChange('smdr', 'port', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        placeholder="3000"
                    />
                </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t">
                <Button
                    onClick={handleStartSMDR}
                    disabled={smdrStatus.running}
                    className={smdrStatus.running ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                    icon={Server}
                >
                    {smdrStatus.running ? 'Service Running' : 'Start Service'}
                </Button>

                {smdrStatus.running && (
                    <Button
                        onClick={handleStopSMDR}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Stop Service
                    </Button>
                )}
            </div>
        </div>
    );

    const renderAlarmSettings = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">SMDR Alarm System</h3>
            <div className="flex items-center space-x-2 mb-4">
                <input
                    type="checkbox"
                    checked={formSettings.alarms.enabled}
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
                        value={formSettings.alarms.email}
                        onChange={(e) => handleChange('alarms', 'email', e.target.value)}
                        disabled={!formSettings.alarms.enabled}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 disabled:bg-gray-100"
                        placeholder="admin@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Timeout (Seconds)</label>
                    <input
                        type="number"
                        value={formSettings.alarms.timeout}
                        onChange={(e) => handleChange('alarms', 'timeout', e.target.value)}
                        disabled={!formSettings.alarms.enabled}
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
                        value={formSettings.app.currency}
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
                        value={formSettings.app.defaultRate}
                        onChange={(e) => handleChange('app', 'defaultRate', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        placeholder="0.00"
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date Format</label>
                    <select
                        value={formSettings.app.dateFormat}
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
                        value={formSettings.app.theme}
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