import LandingNavigasi from '@/components/layout/landing/landing-navigasi';
import Link from 'next/link';

export default async function LandingFooter() {
    return (
        <footer className='pt-10 bg-light '>
            <div className='container flex flex-wrap'>
                <div className='w-full px-4 mb-10 md:w-1/3'>
                    <h2 className='mb-5 flex gap-x-3 items-center'>
                        <Link
                            href='/'
                            className='text-2xl lg:text-3xl italic font-semibold text-dark'
                        >
                            Kolabry
                        </Link>
                    </h2>
                    <div className='flex flex-col gap-y-2.5'>
                        <h3 className='text-xl font-semibold'>Hubungi Kami</h3>
                    </div>
                </div>
                <div className='w-full px-4 mb-10 md:w-1/3'>
                    <h3 className='mb-5 text-xl font-semibold'>Ikuti Kami</h3>
                </div>
                <div className='w-full px-4 mb-10 md:w-1/3'>
                    <h3 className='flex flex-col mb-5 text-xl font-semibold'>
                        Tautan Menu
                    </h3>
                    <LandingNavigasi layout='footer' />
                </div>
                <div className='w-full p-5 border-t border-dark'>
                    <p className='text-xs font-medium text-center text-dark'>
                        Kolabry Copyright &#169; 2025 All rights reserved
                    </p>
                </div>
            </div>
        </footer>
    );
}
