import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [smdrStatus, setSmdrStatus] = useState({ connected: false });
    const [lastCDR, setLastCDR] = useState(null);

    useEffect(() => {
        // Poll SMDR status periodically
        const interval = setInterval(async () => {
            try {
                if (window.electron?.smdr) {
                    const status = await window.electron.smdr.getStatus();
                    setSmdrStatus(status);
                }
            } catch (err) {
                console.error('Failed to get SMDR status', err);
            }
        }, 5000);

        // Listen for new CDRs
        if (window.electron && window.electron.smdr) {
            window.electron.smdr.onNewCDR((cdr) => {
                setLastCDR(cdr);
                // Could also add to a recent list here
            });
        }

        return () => {
            clearInterval(interval);
            if (window.electron && window.electron.smdr) {
                window.electron.smdr.removeCDRListener();
            }
        };
    }, []);

    return (
        <AppContext.Provider value={{ smdrStatus, lastCDR }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
