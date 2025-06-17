import React, { useEffect, useState } from 'react';
import Fetch from '@/utilities/fetch';
import { Edit } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { KolType } from '@/types';
import { NumericFormat } from 'react-number-format';

interface EditKolTypeProps {
    kolData: KolType | null;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditKolType({ kolData: initialKolData, onClose, onUpdate }: EditKolTypeProps) {
    const [formData, setFormData] = useState<Partial<KolType>>({ max_followers: null });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialKolData) {
            setFormData(initialKolData);
        }
    }, [initialKolData]);

    if (!initialKolData) return null;

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

    const handleSave = async () => {
        if (!formData.id) return;
        setLoading(true);

        const payload = { ...formData };
        try {
            const response = await Fetch.PATCH(`/kol-type/${formData.id}`, payload);
            if (response.success === true) {
                toast.success(response.message);
                onUpdate();
                onClose();
            } else if (response.error === 'no_change') {
                toast.info(response.message);
                onClose();
            } else{
                toast.error(response.message);
            }
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
