import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        app: { currency: '$', defaultRate: 0 },
        smdr: {},
        alarms: {}
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const appSettings = await window.electron.settings.get('app') || {};
            const smdrSettings = await window.electron.settings.get('smdr') || {};
            const alarmSettings = await window.electron.settings.get('alarms') || {};

            setSettings({
                app: { currency: '$', defaultRate: 0, ...appSettings },
                smdr: smdrSettings,
                alarms: alarmSettings
            });
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (section, data) => {
        // Optimistic update
        setSettings(prev => ({
            ...prev,
            [section]: data
        }));
        await window.electron.settings.set(section, data);
        // Refresh to ensure sync
        await fetchSettings();
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettings, fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
