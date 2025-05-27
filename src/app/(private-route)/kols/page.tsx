'use client';
import { Add, Kol, Upload } from '@/components/icons';
import { Kols } from '@/types/kol';
import React, { useCallback, useEffect, useState } from 'react';
import SearchInput from '@/components/globals/search-input';
import PaginationLimit from '@/components/globals/pagination-limit';
import Button from '@/components/globals/button';
import { User } from '@/types';
import Fetch from '@/utilities/fetch';

export default function KolsPage() {
    const [kols, setKols] = useState<Kols[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState<User | null>(null);
    const [openAdd, setOpenAdd] = useState(false);
    const [selectedDelete, setSelectedDelete] = useState<{
        id: number;
        name: string;
    } | null>(null);

    const handleLimitChange = (value: string | number) => {
        const parsed = typeof value === 'string' ? parseInt(value) : value;
        setLimit(parsed);
        setPage(1);
    };

    const getKols = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                search,
            });

            const response = await Fetch.GET(`/kols?${query.toString()}`);
            setKols(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        getKols().then();
    }, [getKols]);
    return (
        <main className='pb-10'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Kol className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>
                    Key Opinion Leader
                </span>
            </div>
            <div className='py-3 px-6 flex gap-3 flex-wrap justify-between'>
                <div className='flex flex-wrap gap-3'>
                    <SearchInput onSearch={setSearch} search={'name'} />
                    <PaginationLimit
                        value={limit}
                        onChange={handleLimitChange}
                    />
                </div>
                <div className='place-self-end flex flex-wrap gap-3'>
                    <Button
                        onClick={() => {
                            setOpenAdd(true);
                        }}
                    >
                        <Add className='w-6 h-6' />
                        <p>Add KOL</p>
                    </Button>
                    <Button
                        onClick={() => {
                            setOpenAdd(true);
                        }}
                    >
                        <Upload className='w-6 h-6' />
                        <p>Add KOL</p>
                    </Button>
                </div>
            </div>
        </main>
    );
}
