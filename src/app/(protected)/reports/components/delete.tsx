import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/globals/modal';
import Button from '@/components/globals/button';
import { Trash } from '@/components/icons';
import Fetch from '@/utilities/fetch';

interface Props {
    reportId: number | undefined;
    name: string;
    onClose: () => void;
    onDelete: () => void;
}

export default function DeleteReportKol({ reportId, name, onClose, onDelete }: Props) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await Fetch.DELETE(`/report/${reportId}`, {});
            if (response.success === true) {
                toast.success(response.message);
                onDelete();
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('Failed to delete report kol.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            icon={<Trash className='w-8 h-8 fill-error' />}
            title='Delete KOL Report'
            onClose={onClose}
            footer={
                <Button onClick={handleDelete} disabled={loading} variant='destructive'>
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            }
        >
            <div className='flex flex-col'>
                <p>
                    Are you sure you want to delete Report KOL{' '}
                    <span className='font-semibold text-dark'>{`"${name}"`}</span>?
                </p>
                <p>This action cannot be undone.</p>
            </div>
        </Modal>
    );
}
