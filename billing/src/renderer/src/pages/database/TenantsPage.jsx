import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        loadTenants();
    }, []);

    useEffect(() => {
        if (editingTenant) {
            setValue('name', editingTenant.name);
            setValue('code', editingTenant.code);
            setValue('contact', editingTenant.contact || '');
            setValue('email', editingTenant.email || '');
        } else {
            reset();
        }
    }, [editingTenant, setValue, reset]);

    async function loadTenants() {
        setIsLoading(true);
        try {
            const result = await window.electron.db.find('tenants', {
                selector: { name: { $gte: null } },
                sort: [{ name: 'asc' }],
                use_index: 'idx-tenant-name'
            });
            setTenants(result.docs || []);
        } catch (err) {
            console.error('Failed to load tenants', err);
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmit = async (data) => {
        try {
            if (editingTenant) {
                await window.electron.db.update('tenants', {
                    ...editingTenant,
                    ...data,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await window.electron.db.insert('tenants', {
                    ...data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            setIsModalOpen(false);
            setEditingTenant(null);
            reset();
            loadTenants();
        } catch (err) {
            console.error('Failed to save tenant', err);
            alert('Failed to save tenant');
        }
    };

    const handleDelete = async (tenant) => {
        if (confirm(`Are you sure you want to delete tenant ${tenant.name}?`)) {
            try {
                await window.electron.db.remove('tenants', tenant._id);
                loadTenants();
            } catch (err) {
                console.error('Failed to delete', err);
            }
        }
    };

    const columns = [
        { header: 'Tenant Name', accessor: 'name' },
        { header: 'Code', accessor: 'code' },
        { header: 'Contact', accessor: 'contact' },
        { header: 'Email', accessor: 'email' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-blue-600" />
                    Tenants
                </h2>
                <Button onClick={() => { setEditingTenant(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tenant
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={tenants}
                isLoading={isLoading}
                onEdit={(t) => { setEditingTenant(t); setIsModalOpen(true); }}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTenant ? 'Edit Tenant' : 'New Tenant'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                        <input
                            {...register('name', { required: true })}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tenant Code (e.g. T01)</label>
                        <input
                            {...register('code', { required: true })}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                        <input
                            {...register('contact')}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Tenant</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
