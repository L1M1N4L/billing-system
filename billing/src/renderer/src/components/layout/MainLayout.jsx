import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans">
            <Sidebar />
            <Header />
            <main className="ml-64 pt-16 p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
