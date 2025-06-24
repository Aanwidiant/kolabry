'use client';
import Button from '@/components/globals/button';
import Image from 'next/image';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <main className='flex h-fit lg:min-h-screen items-center'>
            <div className='container'>
                <div className='flex flex-wrap'>
                    <div className='relative flex flex-col gap-y-4 w-full lg:w-1/2 h-96'>
                        <Image src='/500.svg' alt='error-img' fill priority className='object-contain p-6' />
                    </div>
                    <div className='flex flex-col justify-center w-full p-6 lg:w-1/2 space-y-6'>
                        <h1 className='text-5xl font-semibold'>Oops! Something went wrong</h1>
                        <p className='text-lg text-dark-etd dark:text-light-etd'>
                            We encountered an error while loading this page. Please try again or contact support if the
                            issue persists.
                        </p>
                        <div className='flex gap-4'>
                            <Button
                                onClick={() => {
                                    window.location.reload();
                                    reset();
                                }}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
