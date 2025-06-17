import React, { useState } from 'react';
import Fetch from '@/utilities/fetch';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { Campaigns } from '@/types';

interface AddCampaignProps {
    onClose: () => void;
    onAdd: () => void;
}

export default function AddCampaign({ onClose, onAdd }: AddCampaignProps) {
    const [formData, setFormData] = useState<Partial<Campaigns>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleAdd = async () => {
        if (!formData.name) {
            toast.error('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const response = await Fetch.POST('/campaign', formData);
            onAdd();
            onClose();
            toast.success(response.message || 'Campaign created successfully');
        } catch {
            toast.error('Failed to create Campaign.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            title='Add New Campaign'
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
            </div>
        </Modal>
    );
}
