import React, { useState, useEffect } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';

export default function CostsPage() {
    const [costs, setCosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCost, setEditingCost] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        loadCosts();
    }, []);

    useEffect(() => {
        if (editingCost) {
            setValue('code', editingCost.code);
            setValue('destination', editingCost.destination);
            setValue('rate', editingCost.rate);
            setValue('initialPulse', editingCost.initialPulse || 60);
            setValue('subsequentPulse', editingCost.subsequentPulse || 60);
        } else {
            reset();
        }
    }, [editingCost, setValue, reset]);

    async function loadCosts() {
        setIsLoading(true);
        try {
            const result = await window.electron.db.find('costs', {
                selector: { code: { $gte: null } },
                sort: [{ code: 'asc' }]
            });
            setCosts(result.docs || []);
        } catch (err) {
            console.error('Failed to load costs', err);
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmit = async (data) => {
        try {
            // Convert numbers
            data.rate = parseFloat(data.rate);
            data.initialPulse = parseInt(data.initialPulse);
            data.subsequentPulse = parseInt(data.subsequentPulse);

            if (editingCost) {
                await window.electron.db.update('costs', {
                    ...editingCost,
                    ...data,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await window.electron.db.insert('costs', {
                    ...data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            setIsModalOpen(false);
            setEditingCost(null);
            reset();
            loadCosts();
        } catch (err) {
            console.error('Failed to save cost', err);
            alert('Failed to save cost');
        }
    };

    const handleDelete = async (cost) => {
        if (confirm(`Are you sure you want to delete rate for ${cost.destination}?`)) {
            try {
                await window.electron.db.remove('costs', cost._id);
                loadCosts();
            } catch (err) {
                console.error('Failed to delete', err);
            }
        }
    };

    const columns = [
        { header: 'Prefix/Code', accessor: 'code' },
        { header: 'Destination', accessor: 'destination' },
        { header: 'Rate (Cost/Min)', accessor: 'rate', render: (row) => `$${row.rate?.toFixed(2)}` },
        { header: 'Pulse (Init/Sub)', render: (row) => `${row.initialPulse}s / ${row.subsequentPulse}s` },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <DollarSign className="w-6 h-6 mr-3 text-green-600" />
                    Tariffs & Costs
                </h2>
                <Button onClick={() => { setEditingCost(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rate
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={costs}
                isLoading={isLoading}
                onEdit={(c) => { setEditingCost(c); setIsModalOpen(true); }}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCost ? 'Edit Rate' : 'New Rate'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prefix Code</label>
                            <input
                                {...register('code', { required: true })}
                                type="text"
                                placeholder="e.g. 021"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rate (Cost/Min)</label>
                            <input
                                {...register('rate', { required: true })}
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Destination Name</label>
                        <input
                            {...register('destination', { required: true })}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Initial Pulse (sec)</label>
                            <input
                                {...register('initialPulse')}
                                type="number"
                                defaultValue={60}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subsequent Pulse</label>
                            <input
                                {...register('subsequentPulse')}
                                type="number"
                                defaultValue={60}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Rate</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
