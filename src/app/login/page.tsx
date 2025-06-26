'use client';
import React, { useState } from 'react';
import { Eye, EyeSlash } from '@/components/icons';
import Fetch from '@/utilities/fetch';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Button from '@/components/globals/button';
import BarLoader from '@/components/globals/bar-loader';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await Fetch.POST('/user/login', {
                email,
                password,
            });

            if (response.success) {
                login(response.data.token, response.data.user);
                toast.success(response.message || 'Login berhasil!');
                router.push('/dashboard');
            } else {
                if (response.error === 'email') {
                    setEmailError(response.message);
                } else if (response.error === 'password') {
                    setPasswordError(response.message);
                } else {
                    toast.error(response.message || 'Login gagal!');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className='w-full min-h-screen grid grid-cols-2 bg-light'>
            <div className='hidden md:col-span-1 m-2 p-12 rounded-xl bg-primary md:flex flex-col justify-center gap-4'>
                <h1 className='text-3xl font-bold tracking-widest text-light'>KOLABRY</h1>
                <h2 className='text-xl text-light font-medium tracking-wide'>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa, quae.
                </h2>
                <div className='w-96 h-80 self-center bg-secondary rounded-xl'>
                    <p className='w-full h-full text-center place-content-center'>for image</p>
                </div>
                <p className='text-light font-light text-sm'>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus autem consectetur, eius eos ex
                    exercitationem fuga ipsum modi sunt temporibus!
                </p>
            </div>
            <div className='col-span-2 md:col-span-1 flex justify-center items-center'>
                <div className='w-full max-w-md p-4 space-y-8'>
                    <h2 className='text-2xl font-bold tracking-wide'>
                        Hello, Welcome to <span className='text-primary'>Kolabry</span>
                    </h2>
                    <p className='text-gray text-sm'>Enter your email and password to access your account.</p>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-6 w-full'>
                        <div className='flex flex-col gap-2'>
                            <label htmlFor='email' className='font-medium text-dark text-sm'>
                                Email
                            </label>
                            <input
                                type='email'
                                id='email'
                                name='email'
                                value={email}
                                required
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError('');
                                }}
                                className='w-full input-style'
                                placeholder='Email'
                            />
                            {emailError && <p className='text-xs text-error'>{emailError}</p>}
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label htmlFor='password' className='font-medium text-dark text-sm'>
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id='password'
                                    name='password'
                                    value={password}
                                    required
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    className='w-full input-style'
                                    placeholder='Password'
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
                            {passwordError && <p className='text-xs text-error'>{passwordError}</p>}
                        </div>
                        {loading ? (
                            <Button>
                                <BarLoader scale={0.6} />
                            </Button>
                        ) : (
                            <Button type='submit'>Login</Button>
                        )}
                    </form>
                    <p className='w-full text-center text-gray text-sm'>
                        Don`t have an account?{' '}
                        <span className='text-primary underline underline-offset-2 cursor-pointer hover:text-secondary whitespace-nowrap'>
                            Contact Admin Now!
                        </span>
                    </p>
                </div>
            </div>
        </main>
    );
}
