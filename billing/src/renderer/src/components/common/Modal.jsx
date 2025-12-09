import React, { Fragment } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-gray-900/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <div className="relative w-full max-w-lg transform rounded-xl bg-white p-6 shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                        {title}
                    </h3>
                    <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close</span>
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="mt-2">
                    {children}
                </div>
            </div>
        </div>
    );
}
