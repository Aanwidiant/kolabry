'use client';
import { useRouter } from 'next/navigation';
import Button from '@/components/globals/button';
import Image from 'next/image';

export default function NotFound() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <main className='flex h-fit lg:min-h-screen items-center '>
            <div className='container'>
                <div className='flex flex-wrap'>
                    <div className='relative flex flex-col gap-y-4 w-full lg:w-1/2 h-96'>
                        <Image src='/404.svg' alt='not-found-img' fill priority className='object-contain p-6' />
                    </div>
                    <div className='flex flex-col justify-center w-full p-6 lg:w-1/2 space-y-6'>
                        <h1 className='text-5xl font-semibold'>Oops! Page not found</h1>
                        <p className='text-lg text-dark'>
                            Something went wrong! The link may be broken or the page might have been removed.
                        </p>
                        <div className='flex gap-4'>
                            <Button onClick={handleGoBack}>Go Back</Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
