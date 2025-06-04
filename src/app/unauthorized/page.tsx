'use client';
import { useRouter } from 'next/navigation';
import Button from '@/components/globals/button';
import Image from 'next/image';

export default function Unauthorized() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <main className='flex h-fit lg:min-h-screen items-center '>
            <div className='container'>
                <div className='flex flex-wrap gap-y-12'>
                    <div className='relative flex flex-col gap-y-4 w-full px-4 lg:w-1/2 h-[32rem]'>
                        <Image
                            src='/401.svg'
                            alt='not-found-img'
                            fill
                            priority
                            sizes='(max-width: 1024px) 100vw, 50vw'
                            className='object-contain'
                        />
                    </div>
                    <div className='flex flex-col justify-center w-full px-4 lg:w-1/2 space-y-6'>
                        <h1 className='text-5xl font-semibold'>Access Denied</h1>
                        <p className='text-lg text-dark-etd dark:text-light-etd'>
                            {`You don't have permission to access this page. Please go back or contact the administrator if you believe this is an error.`}
                        </p>
                        <div className='flex gap-4'>
                            <Button href='/dashboard'>Go to Dashboard</Button>
                            <Button onClick={handleGoBack}>Go Back</Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
