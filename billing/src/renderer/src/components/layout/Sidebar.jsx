import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Database,
    Phone,
    Users,
    BookOpen,
    Settings,
    BarChart3,
    FileText
} from 'lucide-react';
import logo from '../../assets/logo-grey.svg';

export default function Sidebar() {
    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/extensions', icon: Phone, label: 'Extensions' },
        { to: '/lines', icon: Settings, label: 'Lines / Trunks' },
        { to: '/tenants', icon: Users, label: 'Tenants' },
        { to: '/phonebook', icon: BookOpen, label: 'Phonebook' },
        { to: '/reports', icon: FileText, label: 'Reports' },
        { to: '/charts', icon: BarChart3, label: 'Analytics' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-20">
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <img src={logo} alt="Transtel Billing" className="h-8 w-auto" />
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Menu</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-gray-100 text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 absolute top-0 left-0 animate-ping opacity-75"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700">System Online</span>
                        <span className="text-[10px] text-gray-400">v1.0.0</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
