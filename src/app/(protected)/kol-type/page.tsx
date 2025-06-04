'use client';
import { Add, KolTypes, Edit, Trash } from '@/components/icons';
import React, { useCallback, useEffect, useState } from 'react';
import { KolType } from '@/types';
import Fetch from '@/utilities/fetch';
import SpinnerLoader from '@/components/globals/spinner-loader';
import ActionButton from '@/components/globals/action-button';
import Pagination from '@/components/globals/pagination';
import SearchInput from '@/components/globals/search-input';
import PaginationLimit from '@/components/globals/pagination-limit';
import Button from '@/components/globals/button';
import AddKolType from './components/add';
import EditKolType from './components/edit';
import DeleteKolType from './components/delete';
import DataNotFound from '@/components/globals/data-not-found';

export default function KolTypePage() {
    const [kolTypes, setKolTypes] = useState<KolType[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState<KolType | null>(null);
    const [openAdd, setOpenAdd] = useState(false);
    const [selectedDelete, setSelectedDelete] = useState<{
        id: number;
        name: string;
    } | null>(null);

    const handleLimitChange = (value: string | number | null) => {
        if (value === null) return;
        const parsed = typeof value === 'string' ? parseInt(value) : value;
        setLimit(parsed);
        setPage(1);
    };

    const getKolTypes = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                search,
            });

            const response = await Fetch.GET(`/kol-type?${query.toString()}`);
            setKolTypes(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching kol type:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        getKolTypes().then();
    }, [getKolTypes]);

    return (
        <main className='pb-10'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <KolTypes className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>KOL Type</span>
            </div>

            <div className='py-3 px-6 flex gap-3 flex-wrap justify-between'>
                <div className='flex flex-wrap gap-3'>
                    <SearchInput onSearch={setSearch} search={'name'} />
                    <PaginationLimit value={limit} onChange={handleLimitChange} />
                </div>
                <div className='place-self-end'>
                    <Button
                        onClick={() => {
                            setOpenAdd(true);
                        }}
                    >
                        <Add className='w-6 h-6' />
                        <p>Add KOL Type</p>
                    </Button>
                </div>
            </div>

            <div className='py-3 px-6'>
                <div className='overflow-x-auto rounded-lg border border-gray'>
                    <table className='min-w-full text-sm'>
                        <thead className='border-b border-gray'>
                            <tr className='bg-primary/50'>
                                <th className='w-16 text-center p-4 rounded-tl-lg'>No</th>
                                <th className='text-center p-4'>Name</th>
                                <th className='text-center p-4'>Min Followers</th>
                                <th className='text-center p-4'>Max Followers</th>
                                <th className='text-center p-4 rounded-tr-lg'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className='py-4 text-center'>
                                        <SpinnerLoader scale='scale-80' />
                                    </td>
                                </tr>
                            ) : kolTypes.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <DataNotFound />
                                    </td>
                                </tr>
                            ) : (
                                kolTypes.map((kolType, index) => {
                                    const isLast = index === kolTypes.length - 1;
                                    return (
                                        <tr
                                            key={kolType.id}
                                            className={`bg-light ${isLast ? '' : 'border-b border-gray'} `}
                                        >
                                            <td className={`text-center px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}>
                                                {(page - 1) * limit + index + 1}
                                            </td>
                                            <td className='px-4 py-2 text-left'>{kolType.name}</td>
                                            <td className='px-4 py-2 text-right'>{kolType.min_followers}</td>
                                            <td className='px-4 py-2 text-right'>{kolType.max_followers}</td>
                                            <td className={`px-4 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}>
                                                <div className='flex justify-center gap-2'>
                                                    <ActionButton
                                                        icon={
                                                            <Edit className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                        }
                                                        onClick={() => setSelectedEdit(kolType)}
                                                        tooltipText='Edit'
                                                    />
                                                    <ActionButton
                                                        icon={<Trash className='w-6 h-6 text-error' />}
                                                        onClick={() =>
                                                            setSelectedDelete({
                                                                id: kolType.id,
                                                                name: kolType.name,
                                                            })
                                                        }
                                                        tooltipText='Delete'
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <Pagination
                        totalPages={totalPages}
                        currentPage={page}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                )}
            </div>
            {openAdd && <AddKolType onClose={() => setOpenAdd(false)} onAdd={getKolTypes} />}
            <EditKolType kolData={selectedEdit} onClose={() => setSelectedEdit(null)} onUpdate={getKolTypes} />
            {selectedDelete && (
                <DeleteKolType
                    kolTypeId={selectedDelete.id}
                    name={selectedDelete.name}
                    onClose={() => setSelectedDelete(null)}
                    onDelete={getKolTypes}
                />
            )}
        </main>
    );
}
