import React, { useEffect, useState } from 'react';
import SingleSelect from '@/components/globals/single-select';
import Fetch from '@/utilities/fetch';
import { Edit, Eye, EyeSlash, Warning } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { roleOptions } from '@/constants/option';

interface EditUserProps {
    userData: UserData | null;
    onClose: () => void;
    onUpdate: () => void;
}

interface UserData {
    id: number;
    username: string;
    email: string;
    role: string;
    password: string;
}

export function EditUser({ userData: initialUserData, onClose, onUpdate }: EditUserProps) {
    const [formData, setFormData] = useState<Partial<UserData>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (initialUserData) {
            setFormData(initialUserData);
        }
    }, [initialUserData]);

    if (!initialUserData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRoleChange = (value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            role: value as string,
        }));
    };

    const handleSave = async () => {
        if (!formData.id) return;
        setLoading(true);

        const payload = { ...formData };
        if (!formData.password) delete payload.password;

        try {
            const response = await Fetch.PATCH(`/user/${formData.id}`, payload);
            onUpdate();
            onClose();
            toast.success(response.message);
        } catch {
            toast.error('Error updating user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            icon={<Edit className='w-8 h-8 fill-dark' />}
            title='Edit User'
            footer={
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
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
                                placeholder='Leave blank to keep unchanged'
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
                        <div className='mt-1 flex gap-x-2 items-center text-xs text-error italic'>
                            <Warning className='w-5 h-5' /> Change only if requested by the user.
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
