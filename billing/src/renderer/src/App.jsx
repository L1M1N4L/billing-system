import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ExtensionsPage from './pages/database/ExtensionsPage';
import LinesPage from './pages/database/LinesPage';
import TenantsPage from './pages/database/TenantsPage';
import PhonebookPage from './pages/database/PhonebookPage';
import SettingsPage from './pages/settings/SettingsPage';
import CostsPage from './pages/database/CostsPage';

import ReportsPage from './pages/reports/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="extensions" element={<ExtensionsPage />} />
          <Route path="lines" element={<LinesPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="phonebook" element={<PhonebookPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="charts" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="costs" element={<CostsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
