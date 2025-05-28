'use client';
import { Add, Download, Edit, Kol, Trash, Upload } from '@/components/icons';
import { Kols } from '@/types/kol';
import React, { useCallback, useEffect, useState } from 'react';
import SearchInput from '@/components/globals/search-input';
import PaginationLimit from '@/components/globals/pagination-limit';
import Button from '@/components/globals/button';
import Fetch from '@/utilities/fetch';
import SpinnerLoader from '@/components/globals/spinner-loader';
import ActionButton from '@/components/globals/action-button';
import Pagination from '@/components/globals/pagination';
import SingleSelect from '@/components/globals/single-select';
import DeleteKol from '@/app/(private-route)/kols/components/delete';
import { AddKol } from '@/app/(private-route)/kols/components/add';
import { ageRangeOptions, nicheTypeOptions } from '@/constants/option';
import EditKol from '@/app/(private-route)/kols/components/edit';

export default function KolsPage() {
    const [kols, setKols] = useState<Kols[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
    const [selectedAgeRange, setSelectedAgeRange] = useState<string | null>(null);
    const [selectedEdit, setSelectedEdit] = useState<Kols | null>(null);
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

    const handleNicheChange = (value: string | number | null) => {
        setSelectedNiche(value as string);
        setPage(1);
    };

    const handleAgeRangeChange = (value: string | number | null) => {
        setSelectedAgeRange(value as string);
        setPage(1);
    };

    const getKols = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                search,
                ...(selectedNiche ? { niche: selectedNiche } : {}),
                ...(selectedAgeRange ? { ageRange: selectedAgeRange } : {}),
            });

            const response = await Fetch.GET(`/kol?${query.toString()}`);
            setKols(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching KOLs:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, selectedNiche, selectedAgeRange]);

    useEffect(() => {
        getKols().then();
    }, [getKols]);

    return (
        <main className='pb-10'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Kol className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Key Opinion Leader</span>
            </div>
            <div className='py-3 px-6 flex gap-3 flex-wrap justify-between'>
                <div className='flex flex-wrap gap-3'>
                    <SearchInput onSearch={setSearch} search={'name'} />
                    <SingleSelect
                        id='niche_type'
                        label='Niche'
                        options={nicheTypeOptions}
                        value={selectedNiche ?? null}
                        onChange={handleNicheChange}
                        width='w-32'
                        placeholder='Select niche'
                    />
                    <SingleSelect
                        id='age_range'
                        label='Age Range'
                        options={ageRangeOptions}
                        value={selectedAgeRange ?? null}
                        onChange={handleAgeRangeChange}
                        width='w-40'
                        placeholder='Select age range'
                    />
                    <PaginationLimit value={limit} onChange={handleLimitChange} />
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
                    <Button>
                        <Download className='w-6 h-6' />
                        <p>Template</p>
                    </Button>
                    <Button>
                        <Upload className='w-6 h-6' />
                        <p>Add Bulk</p>
                    </Button>
                </div>
            </div>
            <div className='py-3 px-6'>
                <div className='overflow-x-auto rounded-lg border border-gray'>
                    <table className='min-w-full text-sm'>
                        <thead className='border-b border-gray'>
                            <tr className='bg-primary/50'>
                                <th className='w-16 text-center p-4 rounded-tl-lg'>No</th>
                                <th className='text-center min-w-32 p-4'>Name</th>
                                <th className='text-center p-4'>Niche</th>
                                <th className='text-center p-4'>Audience Age Range</th>
                                <th className='text-center p-4'>Audience Male</th>
                                <th className='text-center p-4'>Audience Female</th>
                                <th className='text-center p-4'>Followers</th>
                                <th className='text-center p-4'>Engagement Rate</th>
                                <th className='text-center p-4'>Reach</th>
                                <th className='text-center min-w-32 p-4'>Rate Card</th>
                                <th className='text-center p-4 rounded-tr-lg'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className='py-4 text-center'>
                                        <SpinnerLoader scale='scale-80' />
                                    </td>
                                </tr>
                            ) : kols.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className='text-center py-4 text-xl font-semibold'>
                                        Data not found.
                                    </td>
                                </tr>
                            ) : (
                                kols.map((kol, index) => {
                                    const isLast = index === kols.length - 1;
                                    return (
                                        <tr
                                            key={kol.id}
                                            className={`bg-light ${isLast ? '' : 'border-b border-gray'} `}
                                        >
                                            <td className={`text-center px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}>
                                                {(page - 1) * limit + index + 1}
                                            </td>
                                            <td className='px-4 py-2 text-left'>{kol.name}</td>
                                            <td className='px-4 py-2 text-right'>{kol.niche}</td>
                                            <td className='px-4 py-2 text-right'>
                                                {kol.audience_age_range.replace('AGE_', '').replace('_', ' - ')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                {(kol.audience_male * 100).toFixed(0)}%
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                {(kol.audience_female * 100).toFixed(0)}%
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                {kol.followers.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>{kol.engagement_rate}</td>
                                            <td className='px-4 py-2 text-right'>
                                                {kol.reach.toLocaleString('id-ID').replace(/\./g, ',')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                Rp {kol.rate_card.toLocaleString('id-ID')}
                                            </td>

                                            <td className={`px-4 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}>
                                                <div className='flex justify-center gap-2'>
                                                    <ActionButton
                                                        icon={
                                                            <Edit className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                        }
                                                        onClick={() => setSelectedEdit(kol)}
                                                        tooltipText='Edit'
                                                    />
                                                    <ActionButton
                                                        icon={<Trash className='w-6 h-6 text-error' />}
                                                        onClick={() =>
                                                            setSelectedDelete({
                                                                id: kol.id,
                                                                name: kol.name,
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
            {openAdd && <AddKol onClose={() => setOpenAdd(false)} onAdd={getKols} />}
            <EditKol kolData={selectedEdit} onClose={() => setSelectedEdit(null)} onUpdate={getKols} />
            {selectedDelete && (
                <DeleteKol
                    kolId={selectedDelete.id}
                    name={selectedDelete.name}
                    onClose={() => setSelectedDelete(null)}
                    onDelete={getKols}
                />
            )}
        </main>
    );
}
