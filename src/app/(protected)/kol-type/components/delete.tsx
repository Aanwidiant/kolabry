import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/globals/modal';
import Button from '@/components/globals/button';
import { Trash } from '@/components/icons';
import Fetch from '@/utilities/fetch';

interface DeleteKolTypeProps {
    kolTypeId: number;
    name: string;
    onClose: () => void;
    onDelete: () => void;
}

export default function DeleteKolType({ kolTypeId, name, onClose, onDelete }: DeleteKolTypeProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await Fetch.DELETE(`/kol-type/${kolTypeId}`, {});
            toast.success(res.message || 'KOL type deleted successfully');
            onDelete();
            onClose();
        } catch {
            toast.error('Failed to delete KOL Type.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            icon={<Trash className='w-8 h-8 fill-error' />}
            title='Delete KOL Type'
            onClose={onClose}
            footer={
                <Button onClick={handleDelete} disabled={loading} variant='destructive'>
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            }
        >
            <div className='flex flex-col'>
                <p>
                    Are you sure you want to delete KOL Type{' '}
                    <span className='font-semibold text-dark'>{`"${name}"`}</span>?
                </p>
                <p>This action cannot be undone.</p>
            </div>
        </Modal>
    );
}
