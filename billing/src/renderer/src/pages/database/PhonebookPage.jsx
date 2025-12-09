import React, { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';

export default function PhonebookPage() {
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        loadContacts();
    }, []);

    useEffect(() => {
        if (editingContact) {
            setValue('name', editingContact.name);
            setValue('number', editingContact.number);
            setValue('category', editingContact.category || 'Personal');
        } else {
            reset();
        }
    }, [editingContact, setValue, reset]);

    async function loadContacts() {
        setIsLoading(true);
        try {
            const result = await window.electron.db.find('phonebook', {
                selector: { name: { $gte: null } },
                sort: [{ name: 'asc' }],
                use_index: 'idx-phonebook-name'
            });
            setContacts(result.docs || []);
        } catch (err) {
            console.error('Failed to load phonebook', err);
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmit = async (data) => {
        try {
            if (editingContact) {
                await window.electron.db.update('phonebook', {
                    ...editingContact,
                    ...data,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await window.electron.db.insert('phonebook', {
                    ...data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            setIsModalOpen(false);
            setEditingContact(null);
            reset();
            loadContacts();
        } catch (err) {
            console.error('Failed to save contact', err);
            alert('Failed to save contact');
        }
    };

    const handleDelete = async (contact) => {
        if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
            try {
                await window.electron.db.remove('phonebook', contact._id);
                loadContacts();
            } catch (err) {
                console.error('Failed to delete', err);
            }
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Number', accessor: 'number' },
        { header: 'Category', accessor: 'category' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <BookOpen className="w-6 h-6 mr-3 text-purple-600" />
                    Phonebook
                </h2>
                <Button onClick={() => { setEditingContact(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={contacts}
                isLoading={isLoading}
                onEdit={(c) => { setEditingContact(c); setIsModalOpen(true); }}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingContact ? 'Edit Contact' : 'New Contact'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                        <input
                            {...register('name', { required: true })}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            {...register('number', { required: true })}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            {...register('category')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                            <option value="Personal">Personal</option>
                            <option value="Business">Business</option>
                            <option value="Supplier">Supplier</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Contact</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
