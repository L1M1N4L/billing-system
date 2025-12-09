import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function LinesPage() {
    const [lines, setLines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLine, setEditingLine] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        loadLines();
    }, []);

    const loadLines = async () => {
        setLoading(true);
        try {
            const result = await window.electron.db.find('lines', {
                selector: { lineNumber: { $gte: null } },
                sort: [{ lineNumber: 'asc' }],
                use_index: 'idx-line-number'
            });
            setLines(result.docs || []);
        } catch (error) {
            console.error('Failed to load lines:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingLine) {
                await window.electron.db.update('lines', { ...editingLine, ...data });
            } else {
                await window.electron.db.insert('lines', data);
            }
            setIsModalOpen(false);
            reset();
            setEditingLine(null);
            loadLines();
        } catch (error) {
            console.error('Error saving line:', error);
        }
    };

    const handleEdit = (line) => {
        setEditingLine(line);
        setValue('lineNumber', line.lineNumber);
        setValue('name', line.name);
        setValue('type', line.type);
        setValue('status', line.status);
        setValue('tariff', line.tariff);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this line?')) {
            try {
                await window.electron.db.remove('lines', id);
                loadLines();
            } catch (error) {
                console.error('Error deleting line:', error);
            }
        }
    };

    const handleOpenModal = () => {
        setEditingLine(null);
        reset();
        setIsModalOpen(true);
    };

    const columns = [
        { key: 'lineNumber', label: 'Line Number', sortable: true },
        { key: 'name', label: 'Name/Label', sortable: true },
        { key: 'type', label: 'Type', sortable: true },
        {
            key: 'status', label: 'Charging', sortable: true,
            render: (val) => val === 'active' ? <span className="text-green-600 font-medium">Enabled</span> : <span className="text-gray-400">Disabled</span>
        },
        { key: 'tariff', label: 'Tariff', sortable: true },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, line) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(line)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(line._id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const filteredLines = lines.filter(l =>
        l.lineNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Line Management</h1>
                    <p className="text-sm text-gray-500">Configure Trunks, CO Lines, and Tariffs</p>
                </div>
                <Button onClick={handleOpenModal} icon={Plus}>Add Line</Button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search lines..."
                    className="flex-1 outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredLines}
                isLoading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingLine ? 'Edit Line' : 'Add New Line'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Line/CO Number</label>
                        <input
                            {...register('lineNumber', { required: 'Line Number is required' })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="e.g., 01, CO-1"
                        />
                        {errors.lineNumber && <p className="text-red-500 text-xs mt-1">{errors.lineNumber.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name / Label</label>
                        <input
                            {...register('name')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="e.g., Main Trunk"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                {...register('type')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            >
                                <option value="CO">CO Trunk</option>
                                <option value="PABX">PABX Extension</option>
                                <option value="VOIP">VOIP Trunk</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Charging Status</label>
                            <select
                                {...register('status')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            >
                                <option value="active">Enabled (Chargeable)</option>
                                <option value="disabled">Disabled (Free)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tariff Code (Optional)</label>
                        <input
                            {...register('tariff')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="e.g., STANDARD, INTL"
                        />
                        <p className="text-xs text-gray-500">Leave empty to use global defaults</p>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingLine ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
