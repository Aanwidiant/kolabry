import React, { useState } from 'react';
import Fetch from '@/utilities/fetch';
import { Add } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { KolType } from '@/types';
import { NumericFormat } from 'react-number-format';

interface AddKolTypeProps {
    onClose: () => void;
    onAdd: () => void;
}

export default function AddKolType({ onClose, onAdd }: AddKolTypeProps) {
    const [formData, setFormData] = useState<Partial<KolType>>({ max_followers: null });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleNumberValueChange =
        (field: 'min_followers' | 'max_followers') =>
        ({ value }: { value: string }) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value === '' ? null : parseInt(value),
            }));
        };

    const handleAdd = async () => {
        setLoading(true);
        try {
            const response = await Fetch.POST('/kol-type', formData);
            if (response.success === true) {
                toast.success(response.message);
                onAdd();
                onClose();
            } else {
                toast.error(response.message);
            }
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
                    <NumericFormat
                        className='col-span-3 input-style'
                        id='min_followers'
                        name='min_followers'
                        value={formData.min_followers}
                        thousandSeparator='.'
                        decimalSeparator=','
                        allowNegative={false}
                        onValueChange={handleNumberValueChange('min_followers')}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='max_followers'>
                        Max Followers
                    </label>
                    <NumericFormat
                        className='col-span-3 input-style'
                        id='max_followers'
                        name='max_followers'
                        value={formData.max_followers}
                        thousandSeparator='.'
                        decimalSeparator=','
                        allowNegative={false}
                        onValueChange={handleNumberValueChange('max_followers')}
                    />
                </div>
            </div>
        </Modal>
    );
}
