import React, { useState } from 'react';
import Fetch from '@/utilities/fetch';
import { Add } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { KolType } from '@/types';

interface AddKolTypeProps {
    onClose: () => void;
    onAdd: () => void;
}

export default function AddKolType({ onClose, onAdd }: AddKolTypeProps) {
    const [formData, setFormData] = useState<Partial<KolType>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleAdd = async () => {
        if (!formData.name || !formData.min_followers || !formData.max_followers) {
            toast.error('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const response = await Fetch.POST('/kol-type', formData);
            onAdd();
            onClose();
            toast.success(response.message || 'KOL Type created successfully');
        } catch {
            toast.error('Failed to create KOL Type.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            icon={<Add className='w-8 h-8 fill-dark' />}
            title='Add New KOL Type'
            footer={
                <Button onClick={handleAdd} disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                </Button>
            }
        >
            <div className='grid gap-4'>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='name'>
                        Name
                    </label>
                    <input
                        className='col-span-3 input-style'
                        id='name'
                        name='name'
                        type='text'
                        value={formData.name ?? ''}
                        onChange={handleChange}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='min_followers'>
                        Min Followers
                    </label>
                    <input
                        className='col-span-3 input-style'
                        id='min_followers'
                        name='min_followers'
                        type='number'
                        value={formData.min_followers ?? ''}
                        onChange={handleChange}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='max_followers'>
                        Max Followers
                    </label>
                    <input
                        className='col-span-3 input-style'
                        id='max_followers'
                        name='max_followers'
                        type='number'
                        value={formData.max_followers ?? ''}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </Modal>
    );
}
