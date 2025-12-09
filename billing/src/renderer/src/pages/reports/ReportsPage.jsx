import React, { useState } from 'react';
import { FileText, Printer, Eye, Download, Search, Filter, Calendar as CalIcon, Clock, ChevronDown } from 'lucide-react';
import Button from '../../components/common/Button';
import { useForm } from 'react-hook-form';
import { format, parse } from 'date-fns';

export default function ReportsPage() {
    const [reportResult, setReportResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, watch } = useForm({
        defaultValues: {
            grouping: 'extension',
            dateFrom: new Date().toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
            timeFrom: '00:00',
            timeTo: '23:59',
            reportType: 'detail',
            callType: 'outgoing',
            options: {
                local: true,
                longDistance: true,
                international: true,
                mobile: true,
                printAccount: true
            }
        }
    });

    const reportType = watch('reportType');

    const onSubmit = async (data) => {
        setIsLoading(true);
        setReportResult(null);
        try {
            const criteria = {
                ...data,
                startDate: data.dateFrom,
                endDate: data.dateTo,
                groupBy: data.grouping
            };

            const result = await window.electron.reports.generate(data.reportType, criteria);
            setReportResult({ type: data.reportType, data: result, criteria: data });
        } catch (err) {
            console.error('Report generation failed', err);
            alert('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format) => {
        if (!reportResult) return;
        try {
            await window.electron.reports.export(reportResult.type, reportResult.data, format);
            alert(`Exported to ${format}`);
        } catch (err) {
            alert('Export failed');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            // Assume YYYYMMDD
            if (dateStr.length === 8) {
                const date = parse(dateStr, 'yyyyMMdd', new Date());
                return format(date, 'MMM dd, yyyy');
            }
            // Fallback for ISO or other formats
            return format(new Date(dateStr), 'MMM dd, yyyy');
        } catch (e) {
            return dateStr;
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        try {
            // Assume HHMMSS
            if (timeStr.length === 6) {
                const time = parse(timeStr, 'HHmmss', new Date());
                return format(time, 'HH:mm:ss');
            }
            // Assume HHMM
            if (timeStr.length === 4) {
                const time = parse(timeStr, 'HHmm', new Date());
                return format(time, 'HH:mm');
            }
            return timeStr;
        } catch (e) {
            return timeStr;
        }
    };

    const SectionHeader = ({ title, icon: Icon }) => (
        <div className="flex items-center space-x-2 mb-4 border-b border-gray-100 pb-2">
            {Icon && <Icon className="w-4 h-4 text-blue-500" />}
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h3>
        </div>
    );

    const InputLabel = ({ label }) => (
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    );

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Report Generator</h1>
                    <p className="text-sm text-gray-500">Create detailed call logs and cost summaries</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
                {/* Configuration Panel */}
                <div className="col-span-12 lg:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Main Settings Card */}
                        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 backdrop-blur-sm">
                            <SectionHeader title="Report Scope" icon={Filter} />

                            <div className="space-y-4">
                                {/* Grouping */}
                                <div>
                                    <InputLabel label="Group By" />
                                    <div className="grid grid-cols-3 gap-2">
                                        {['extension', 'account', 'division', 'line', 'dial'].map((g) => (
                                            <label key={g} className="relative flex cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value={g}
                                                    {...register('grouping')}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-full px-3 py-2 text-xs font-medium text-center rounded-lg border border-gray-200 text-gray-600 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 transition-all hover:bg-gray-50 capitalize">
                                                    {g}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel label="Start Date" />
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CalIcon className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input type="date" {...register('dateFrom')} className="pl-9 w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50" />
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel label="End Date" />
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CalIcon className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input type="date" {...register('dateTo')} className="pl-9 w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50" />
                                        </div>
                                    </div>
                                </div>

                                {/* Time Range */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel label="Start Time" />
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input type="time" {...register('timeFrom')} className="pl-9 w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50" />
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel label="End Time" />
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input type="time" {...register('timeTo')} className="pl-9 w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filtering Card */}
                        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50">
                            <SectionHeader title="Filters & Limits" icon={Search} />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel label="Min Duration (sec)" />
                                    <input {...register('minDuration')} type="number" placeholder="0" className="w-full rounded-lg border-gray-200 text-sm bg-gray-50/50 focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <InputLabel label="Min Cost ($)" />
                                    <input {...register('minCost')} type="number" step="0.01" placeholder="0.00" className="w-full rounded-lg border-gray-200 text-sm bg-gray-50/50 focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                                <div className="col-span-2">
                                    <InputLabel label="Number Pattern (Optional)" />
                                    <input {...register('numberPattern')} placeholder="e.g. 09*" className="w-full rounded-lg border-gray-200 text-sm bg-gray-50/50 focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex flex-wrap gap-3">
                                    {['Local', 'LongDistance', 'International', 'Mobile'].map(opt => (
                                        <label key={opt} className="inline-flex items-center">
                                            <input type="checkbox" {...register(`options.${opt.toLowerCase()}`)} className="rounded text-blue-600 border-gray-300 focus:ring-blue-500" />
                                            <span className="ml-2 text-xs text-gray-600">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button type="submit" icon={Eye} isActive={true} isLoading={isLoading} className="justify-center shadow-lg shadow-blue-500/20">
                                Generate Preview
                            </Button>
                            <div className="flex space-x-2">
                                <button type="button" onClick={() => handleExport('pdf')} className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                    <FileText className="w-4 h-4 mr-2" /> PDF
                                </button>
                                <button type="button" onClick={() => handleExport('excel')} className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                    <Download className="w-4 h-4 mr-2" /> XLS
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Preview Panel */}
                <div className="col-span-12 lg:col-span-8 flex flex-col h-full overflow-hidden">
                    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col h-full relative">
                        {!reportResult ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-gray-900 font-medium">Ready to Generate</h3>
                                <p className="text-gray-500 text-sm mt-1">Configure options on the left and click Generate</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                {/* Report Header */}
                                <div className="p-6 border-b border-gray-100 bg-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                                                {reportResult.type} Report
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {reportResult.criteria.grouping} • {reportResult.criteria.dateFrom} to {reportResult.criteria.dateTo}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">
                                                ${reportResult.data.summary.totalCost?.toFixed(2)}
                                            </div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Cost</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Report Table */}
                                <div className="flex-1 overflow-auto p-0">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                            <tr>
                                                {reportResult.type === 'detail' ? (
                                                    <>
                                                        <th className="text-left py-3 px-6 font-semibold text-gray-600">Time</th>
                                                        <th className="text-left py-3 px-6 font-semibold text-gray-600">Ext</th>
                                                        <th className="text-left py-3 px-6 font-semibold text-gray-600">Number</th>
                                                        <th className="text-right py-3 px-6 font-semibold text-gray-600">Duration</th>
                                                        <th className="text-right py-3 px-6 font-semibold text-gray-600">Cost</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="text-left py-3 px-6 font-semibold text-gray-600">Group</th>
                                                        <th className="text-right py-3 px-6 font-semibold text-gray-600">Calls</th>
                                                        <th className="text-right py-3 px-6 font-semibold text-gray-600">Duration</th>
                                                        <th className="text-right py-3 px-6 font-semibold text-gray-600">Cost</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {reportResult.data.rows.map((row, i) => (
                                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                                    {reportResult.type === 'detail' ? (
                                                        <>
                                                            <td className="py-2 px-6 text-gray-600">{formatDate(row.date)} <span className="text-gray-400">{formatTime(row.time)}</span></td>
                                                            <td className="py-2 px-6 font-medium text-gray-900">{row.extension}</td>
                                                            <td className="py-2 px-6 text-gray-600 font-mono tracking-tight">{row.dialedNumber}</td>
                                                            <td className="text-right py-2 px-6 text-gray-600">{row.duration}s</td>
                                                            <td className="text-right py-2 px-6 font-medium text-gray-900">${row.cost?.toFixed(2)}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="py-3 px-6 font-medium text-gray-900">{row.key}</td>
                                                            <td className="text-right py-3 px-6 text-gray-600">{row.calls}</td>
                                                            <td className="text-right py-3 px-6 text-gray-600">{row.duration}s</td>
                                                            <td className="text-right py-3 px-6 font-bold text-gray-900">${row.cost?.toFixed(2)}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
