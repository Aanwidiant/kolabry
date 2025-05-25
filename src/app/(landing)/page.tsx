'use client'
import Button from '@/components/globals/button';
import SpinnerLoader from '@/components/globals/spinner-loader';
import Pagination from '@/components/globals/pagination';
import { useState } from 'react';

export default function Home() {
    const [currentPage, setCurrentPage] = useState(1);
    return (
        <main className='min-h-screen flex justify-center items-center flex-col gap-2'>
            {/*<h1 className='text-xl font-medium'>*/}
            {/*    Akan dibuat landing page dengan konten landing, about, pricing,*/}
            {/*    developer team*/}
            {/*</h1>*/}
            {/*<Button isLoading={true}>Button</Button>*/}
            <SpinnerLoader />
            <Pagination
                totalPages={6}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </main>
    );
}
