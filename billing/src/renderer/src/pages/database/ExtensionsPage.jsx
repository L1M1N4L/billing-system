import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';

export default function ExtensionsPage() {
    const [extensions, setExtensions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExt, setEditingExt] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        loadExtensions();
    }, []);

    useEffect(() => {
        if (editingExt) {
            setValue('extension', editingExt.extension);
            setValue('name', editingExt.name);
            setValue('division', editingExt.division || '');
            setValue('account', editingExt.account || '');
            setValue('tenant', editingExt.tenant || '');
            setValue('lineType', editingExt.lineType || 'PABX');
        } else {
            reset();
        }
    }, [editingExt, setValue, reset]);

    async function loadExtensions() {
        setIsLoading(true);
        try {
            // Direct DB query via IPC
            const result = await window.electron.db.find('extensions', {
                selector: { extension: { $gte: null } },
                sort: [{ extension: 'asc' }]
            });
            setExtensions(result.docs || []);
        } catch (err) {
            console.error('Failed to load extensions', err);
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmit = async (data) => {
        try {
            if (editingExt) {
                await window.electron.db.update('extensions', {
                    ...editingExt,
                    ...data,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await window.electron.db.insert('extensions', {
                    ...data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            setIsModalOpen(false);
            setEditingExt(null);
            reset();
            loadExtensions();
        } catch (err) {
            console.error('Failed to save extension', err);
            alert('Failed to save extension');
        }
    };

    const handleEdit = (ext) => {
        setEditingExt(ext);
        setIsModalOpen(true);
    };

    const handleDelete = async (ext) => {
        if (confirm(`Are you sure you want to delete extension ${ext.extension}?`)) {
            try {
                await window.electron.db.remove('extensions', ext._id);
                loadExtensions();
            } catch (err) {
                console.error('Failed to delete', err);
            }
        }
    };

    const columns = [
        { header: 'Extension', accessor: 'extension' },
        { header: 'Name', accessor: 'name' },
        { header: 'Division', accessor: 'division' },
        { header: 'Line Type', accessor: 'lineType' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Extensions</h2>
                <Button onClick={() => { setEditingExt(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Extension
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={extensions}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingExt ? 'Edit Extension' : 'New Extension'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Extension Number</label>
                        <input
                            {...register('extension', { required: true })}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                            {...register('name', { required: true })}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Division</label>
                            <input
                                {...register('division')}
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Line Type</label>
                            <select
                                {...register('lineType')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                                <option value="PABX">Extension (PABX)</option>
                                <option value="CO">CO Line</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Extension</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
