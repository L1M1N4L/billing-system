import React from 'react';
import { Bell, Search } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10 transition-all duration-300">
            <div className="flex items-center w-96">
                <div className="relative w-full group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all text-sm placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-0.5 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-medium text-sm shadow-md ring-2 ring-white cursor-pointer hover:shadow-lg transition-all">
                    A
                </div>
            </div>
        </header>
    );
}
