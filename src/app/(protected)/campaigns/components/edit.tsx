import React, { useEffect, useState } from 'react';
import Fetch from '@/utilities/fetch';
import { Edit } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { Campaigns } from '@/types';

interface EditCampaignProps {
    campaignData: Campaigns | null;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditCampaign({ campaignData: initialCampaignData, onClose, onUpdate }: EditCampaignProps) {
    const [formData, setFormData] = useState<Partial<Campaigns>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialCampaignData) {
            setFormData(initialCampaignData);
        }
    }, [initialCampaignData]);

    if (!initialCampaignData) return null;

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
            const response = await Fetch.PATCH(`/campaign/${formData.id}`, payload);
            onUpdate();
            onClose();
            toast.success(response.message);
        } catch {
            toast.error('Error updating campaign.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            icon={<Edit className='w-8 h-8 fill-dark' />}
            title='Edit Campaign'
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
            </div>
        </Modal>
    );
}
