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
import DataNotFound from '@/components/globals/data-not-found';
import DeleteCampaign from './components/delete';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/globals/status-badge';

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaigns[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedDelete, setSelectedDelete] = useState<{
        id: number;
        name: string;
    } | null>(null);

    const handleViewDetail = (slug_id: string) => {
        router.push(`/campaigns/${slug_id}`);
    };

    const handleEdit = (slug_id: string) => {
        router.push(`/campaigns/${slug_id}/edit`);
    };

    const generateSlugId = (campaign: Campaigns) => {
        return `${campaign.name.toLowerCase().replace(/\s+/g, '-')}-${campaign.id}`;
    };

    const handleLimitChange = (value: string | number | null) => {
        if (value === null) return;
        const parsed = typeof value === 'string' ? parseInt(value) : value;
        setLimit(parsed);
        setPage(1);
    };

    function getCampaignStatus(startDate: string | Date, endDate: string | Date): 'upcoming' | 'ongoing' | 'finished' {
        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (today < start) return 'upcoming';
        if (today > end) return 'finished';
        return 'ongoing';
    }


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
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full py-4 border-b border-gray flex items-center gap-3 px-6'>
                <Campaign className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Campaign</span>
            </div>
            <div className='h-[calc(100vh-10rem)] overflow-y-auto'>
                <div className='py-3 px-6 flex gap-3 flex-wrap justify-between'>
                    <div className='flex flex-wrap gap-3'>
                        <SearchInput onSearch={setSearch} search={'name'} />
                        <PaginationLimit value={limit} onChange={handleLimitChange} />
                    </div>
                    <div className='place-self-end'>
                        <Button onClick={() => router.push('/campaigns/add')}>
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
                                    <th className='text-center p-4'>Budget per KOL</th>
                                    <th className='text-center p-4'>Status</th>
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
                                                <td
                                                    className={`text-center px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}
                                                >
                                                    {(page - 1) * limit + index + 1}
                                                </td>
                                                <td className='px-4 py-2 text-left'>{campaign.name}</td>
                                                <td className='px-4 py-2 text-right'>{campaign.target_niche}</td>
                                                <td className='px-4 py-2 text-right'>
                                                    {campaign.target_engagement.toFixed(2)}%
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {campaign.target_reach.toLocaleString('id-ID')}
                                                </td>
                                                <td className='px-4 py-2 text-right'>{campaign.target_gender}</td>
                                                <td className='px-4 py-2 text-right'>{campaign.target_gender_min}%</td>
                                                <td className='px-4 py-2 text-right'>
                                                    {campaign.target_age_range.replace('AGE_', '').replace('_', ' - ')}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    Rp {Number(campaign.budget).toLocaleString('id-ID')}
                                                </td>
                                                <td className='px-4 py-2 text-center'>
                                                    {StatusBadge(getCampaignStatus(campaign.start_date, campaign.end_date))}
                                                </td>
                                                <td
                                                    className={`px-4 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}
                                                >
                                                    <div className='flex justify-end gap-2'>
                                                        <ActionButton
                                                            icon={
                                                                <Eye className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                            }
                                                            tooltipText='Detail'
                                                            onClick={() => handleViewDetail(generateSlugId(campaign))}
                                                        />
                                                        {getCampaignStatus(campaign.start_date, campaign.end_date) === 'upcoming' && (
                                                            <ActionButton
                                                                icon={
                                                                    <Edit className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                                }
                                                                onClick={() => handleEdit(generateSlugId(campaign))}
                                                                tooltipText='Edit'
                                                            />
                                                        )}

                                                        <ActionButton
                                                            icon={<Trash className='w-6 h-6 fill-error' />}
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
            </div>
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
