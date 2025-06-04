import React, { useEffect, useState } from 'react';
import Fetch from '@/utilities/fetch';
import { Edit } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { KolType } from '@/types';

interface EditKolTypeProps {
    kolData: KolType | null;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditKolType({ kolData: initialKolData, onClose, onUpdate }: EditKolTypeProps) {
    const [formData, setFormData] = useState<Partial<KolType>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialKolData) {
            setFormData(initialKolData);
        }
    }, [initialKolData]);

    if (!initialKolData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSave = async () => {
        if (!formData.id) return;
        setLoading(true);

        const payload = { ...formData };
        try {
            const response = await Fetch.PATCH(`/kol-type/${formData.id}`, payload);
            onUpdate();
            onClose();
            toast.success(response.message);
        } catch {
            toast.error('Error updating KOL Type.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            icon={<Edit className='w-8 h-8 fill-dark' />}
            title='Edit KOL Type'
            footer={
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
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
