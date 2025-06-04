import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/globals/modal';
import Button from '@/components/globals/button';
import { Trash } from '@/components/icons';
import Fetch from '@/utilities/fetch';

interface DeleteUserModalProps {
    userId: number;
    userName: string;
    onClose: () => void;
    onDelete: () => void;
}

export default function DeleteUser({ userId, userName, onClose, onDelete }: DeleteUserModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await Fetch.DELETE(`/user/${userId}`, {});
            toast.success(res.message || 'User deleted successfully');
            onDelete();
            onClose();
        } catch {
            toast.error('Failed to delete user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            icon={<Trash className='w-8 h-8 fill-error' />}
            title='Delete User'
            onClose={onClose}
            footer={
                <Button onClick={handleDelete} disabled={loading} variant='destructive'>
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            }
        >
            <div className='flex flex-col'>
                <p>
                    Are you sure you want to delete user{' '}
                    <span className='font-semibold text-dark'>{`"${userName}"`}</span>?
                </p>
                <p>This action cannot be undone.</p>
            </div>
        </Modal>
    );
}
