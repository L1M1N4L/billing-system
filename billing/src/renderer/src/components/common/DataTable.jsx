import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Button from './Button';

export default function DataTable({
    columns,
    data = [],
    isLoading = false,
    onEdit,
    onDelete,
    pagination = null
}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="w-full p-8 text-center bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No records found</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 font-medium text-gray-700 ${col.accessor ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}
                                    onClick={() => col.accessor && handleSort(col.accessor)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{col.header}</span>
                                        {col.accessor && (
                                            <span className="text-gray-400">
                                                {sortConfig.key === col.accessor ? (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                                                ) : (
                                                    <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-50" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th className="px-6 py-4 font-medium text-gray-700 text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedData.map((row, rowIdx) => (
                            <tr key={row._id || rowIdx} className="hover:bg-gray-50 transition-colors">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="px-6 py-4 text-gray-600">
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(row)}
                                                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(row)}
                                                className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Showing {pagination.from} to {pagination.to} of {pagination.total} results
                    </span>
                    <div className="flex space-x-2">
                        <Button size="sm" variant="outline" disabled={!pagination.hasPrev}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" disabled={!pagination.hasNext}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
