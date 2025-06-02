'use client';
import { Add, Campaign, Edit, Eye, Trash } from '@/components/icons';
import React, { useCallback, useEffect, useState } from 'react';
import SearchInput from '@/components/globals/search-input';
import PaginationLimit from '@/components/globals/pagination-limit';
import Button from '@/components/globals/button';
import { Campaigns } from '@/types';
import Fetch from '@/utilities/fetch';
import SpinnerLoader from '@/components/globals/spinner-loader';
import ActionButton from '@/components/globals/action-button';
import Pagination from '@/components/globals/pagination';
import { format } from 'date-fns';
import DataNotFound from '@/components/globals/data-not-found';
import DeleteCampaign from './components/delete';
import AddCampaign from './components/add';
import EditCampaign from './components/edit';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaigns[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState<Campaigns | null>(null);
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

    const getCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                search,
            });

            const response = await Fetch.GET(`/campaign?${query.toString()}`);
            setCampaigns(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching campaign type:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        getCampaigns().then();
    }, [getCampaigns]);

    return (
        <main className='pb-10'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Campaign className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Campaign</span>
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
                        <p>Add Campaign</p>
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
                                <th className='text-center p-4'>Target Niche</th>
                                <th className='text-center p-4'>Target Engangement</th>
                                <th className='text-center p-4'>Target Reach</th>
                                <th className='text-center p-4'>Target Gender</th>
                                <th className='text-center p-4'>Target Gender Percentage</th>
                                <th className='text-center p-4'>Target Age Range</th>
                                <th className='text-center p-4'>Start Date</th>
                                <th className='text-center p-4'>End Date</th>
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
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={11}>
                                        <DataNotFound />
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign, index) => {
                                    const isLast = index === campaigns.length - 1;
                                    return (
                                        <tr
                                            key={campaign.id}
                                            className={`bg-light ${isLast ? '' : 'border-b border-gray'} `}
                                        >
                                            <td className={`text-center px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}>
                                                {(page - 1) * limit + index + 1}
                                            </td>
                                            <td className='px-4 py-2 text-left'>{campaign.name}</td>
                                            <td className='px-4 py-2 text-left'>{campaign.target_niche}</td>
                                            <td className='px-4 py-2 text-left'>{campaign.target_engagement}</td>
                                            <td className='px-4 py-2 text-left'>{campaign.target_reach}</td>
                                            <td className='px-4 py-2 text-left'>{campaign.target_gender}</td>
                                            <td className='px-4 py-2 text-left'>{campaign.target_gender_min}</td>
                                            <td className='px-4 py-2 text-left'>
                                                {campaign.target_age_range.replace('AGE_', '').replace('_', ' - ')}
                                            </td>
                                            <td className='px-4 py-2 text-left'>
                                                {format(campaign.start_date, 'dd MMM yyyy')}
                                            </td>
                                            <td className='px-4 py-2 text-left'>
                                                {format(campaign.end_date, 'dd MMM yyyy')}
                                            </td>
                                            <td className={`px-4 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}>
                                                <div className='flex justify-center gap-2'>
                                                    <ActionButton
                                                        icon={
                                                            <Eye className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                        }
                                                        tooltipText='Detail'
                                                    />
                                                    <ActionButton
                                                        icon={
                                                            <Edit className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                        }
                                                        onClick={() => setSelectedEdit(campaign)}
                                                        tooltipText='Edit'
                                                    />
                                                    <ActionButton
                                                        icon={<Trash className='w-6 h-6 text-error' />}
                                                        onClick={() =>
                                                            setSelectedDelete({
                                                                id: campaign.id,
                                                                name: campaign.name,
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
            {openAdd && <AddCampaign onClose={() => setOpenAdd(false)} onAdd={getCampaigns} />}
            <EditCampaign campaignData={selectedEdit} onClose={() => setSelectedEdit(null)} onUpdate={getCampaigns} />
            {selectedDelete && (
                <DeleteCampaign
                    campaignId={selectedDelete.id}
                    name={selectedDelete.name}
                    onClose={() => setSelectedDelete(null)}
                    onDelete={getCampaigns}
                />
            )}
        </main>
    );
}
