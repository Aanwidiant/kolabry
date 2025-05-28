import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/globals/modal';
import Button from '@/components/globals/button';
import { Trash } from '@/components/icons';
import Fetch from '@/utilities/fetch';

interface DeleteCampaignTypeProps {
    campaignTypeId: number;
    name: string;
    onClose: () => void;
    onDelete: () => void;
}

export default function DeleteCampaignType({ campaignTypeId, name, onClose, onDelete }: DeleteCampaignTypeProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await Fetch.DELETE(`/campaign-type/${campaignTypeId}`, {});
            toast.success(res.message || 'Campaign type deleted successfully');
            onDelete();
            onClose();
        } catch {
            toast.error('Failed to delete campaign type.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            icon={<Trash className='w-8 h-8 fill-error' />}
            title='Delete Campaign Type'
            onClose={onClose}
            footer={
                <Button onClick={handleDelete} disabled={loading} variant='destructive'>
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            }
        >
            <div className='flex flex-col'>
                <p>
                    Are you sure you want to delete campaign type{' '}
                    <span className='font-semibold text-dark'>{name}</span>?
                </p>
                <p>This action cannot be undone.</p>
            </div>
        </Modal>
    );
}
