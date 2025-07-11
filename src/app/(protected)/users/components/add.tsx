import React, { useState } from 'react';
import SingleSelect from '@/components/globals/single-select';
import Fetch from '@/utilities/fetch';
import { Eye, EyeSlash, Add } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { roleOptions } from '@/constants/option';
import { User } from '@/types';
import { UserRole } from '@prisma/client';

interface AddUserProps {
    onClose: () => void;
    onAdd: () => void;
}

export default function AddUser({ onClose, onAdd }: AddUserProps) {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value: string | number | null) => {
        if (typeof value === 'string' && ['ADMIN', 'KOL_MANAGER', 'BRAND'].includes(value)) {
            setFormData((prev) => ({ ...prev, role: value as UserRole }));
        }
    };

    const handleAdd = async () => {
        setLoading(true);
        try {
            const response = await Fetch.POST('/user', formData);
            if (response.success === true) {
                toast.success(response.message);
                onAdd();
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            icon={<Add className='w-8 h-8 fill-dark' />}
            title='Add New User'
            footer={
                <Button onClick={handleAdd} disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                </Button>
            }
        >
            <div className='grid gap-4'>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='username'>
                        Username
                    </label>
                    <input
                        className='col-span-3 input-style'
                        id='username'
                        name='username'
                        type='text'
                        value={formData.username ?? ''}
                        onChange={handleChange}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='email'>
                        Email
                    </label>
                    <input
                        className='col-span-3 input-style'
                        id='email'
                        name='email'
                        type='email'
                        value={formData.email ?? ''}
                        onChange={handleChange}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='role'>
                        Role
                    </label>
                    <div className='col-span-3'>
                        <SingleSelect
                            id='role'
                            options={roleOptions}
                            value={formData.role ?? null}
                            onChange={handleRoleChange}
                            width='w-full'
                            allowClear={false}
                        />
                    </div>
                </div>
                <div className='grid grid-cols-5 gap-4'>
                    <label className='col-span-2 pt-2 font-medium' htmlFor='password'>
                        Password
                    </label>
                    <div className='col-span-3'>
                        <div className='relative'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className='input-style w-full pr-10'
                                id='password'
                                name='password'
                                value={formData.password ?? ''}
                                onChange={handleChange}
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-dark transition'
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <EyeSlash className='fill-dark w-5 h-5' />
                                ) : (
                                    <Eye className='fill-dark w-5 h-5' />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
