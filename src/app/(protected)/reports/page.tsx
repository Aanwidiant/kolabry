'use client';
import { Eye, Report } from '@/components/icons';
import React, { useCallback, useEffect, useState } from 'react';
import SearchInput from '@/components/globals/search-input';
import PaginationLimit from '@/components/globals/pagination-limit';
import SpinnerLoader from '@/components/globals/spinner-loader';
import DataNotFound from '@/components/globals/data-not-found';
import StatusBadge from '@/components/globals/status-badge';
import ActionButton from '@/components/globals/action-button';
import Pagination from '@/components/globals/pagination';
import { useRouter } from 'next/navigation';
import { Campaigns } from '@/types';
import Fetch from '@/utilities/fetch';
import { format } from 'date-fns';

export default function ReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<Campaigns[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleLimitChange = (value: string | number | null) => {
        if (value === null) return;
        const parsed = typeof value === 'string' ? parseInt(value) : value;
        setLimit(parsed);
        setPage(1);
    };

    const getReports = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                search,
            });

            const response = await Fetch.GET(`/report?${query.toString()}`);
            setReports(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        getReports().then();
    }, [getReports]);

    function getCampaignStatus(startDate: string | Date, endDate: string | Date): 'upcoming' | 'ongoing' | 'finished' {
        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (today < start) return 'upcoming';
        if (today > end) return 'finished';
        return 'ongoing';
    }

    const handleViewReport = (slug_id: string) => {
        router.push(`/reports/${slug_id}`);
    };

    const generateSlugId = (campaign: Campaigns) => {
        return `${campaign.name.toLowerCase().replace(/\s+/g, '-')}-${campaign.id}`;
    };

    return (
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full py-4 border-b border-gray flex items-center gap-3 px-6'>
                <Report className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Report</span>
            </div>
            <div className='h-[calc(100vh-10rem)] overflow-y-auto'>
                <div className='py-3 px-6 flex gap-3 flex-wrap items-center'>
                    <SearchInput onSearch={setSearch} search={'name'} />
                    <PaginationLimit value={limit} onChange={handleLimitChange} />
                </div>
                <div className='py-3 px-6'>
                    <div className='overflow-x-auto rounded-lg border border-gray'>
                        <table className='min-w-full text-sm'>
                            <thead className='border-b border-gray'>
                                <tr className='bg-primary/50'>
                                    <th className='w-16 text-center p-4 rounded-tl-lg'>No</th>
                                    <th className='text-center p-4'>Campaign Name</th>
                                    <th className='text-center p-4'>Brand</th>
                                    <th className='text-center p-4'>Niche</th>
                                    <th className='text-center p-4'>KOL involved</th>
                                    <th className='text-center p-4'>Start Date</th>
                                    <th className='text-center p-4'>End Date</th>
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
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={11}>
                                            <DataNotFound />
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report, index) => {
                                        const isLast = index === reports.length - 1;
                                        return (
                                            <tr
                                                key={report.id}
                                                className={`bg-light ${isLast ? '' : 'border-b border-gray'} `}
                                            >
                                                <td
                                                    className={`text-center px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}
                                                >
                                                    {(page - 1) * limit + index + 1}
                                                </td>
                                                <td className='px-4 py-2 text-left'>{report.name}</td>
                                                <td className='px-4 py-2 text-right'>{report.brand_name}</td>
                                                <td className='px-4 py-2 text-right'>{report.target_niche}</td>
                                                <td className='px-4 py-2 text-center'>{report.count_kols}</td>
                                                <td className='px-4 py-2 text-right'>
                                                    {format(new Date(report.start_date), 'dd MMMM yyyy')}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {format(new Date(report.end_date), 'dd MMMM yyyy')}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {StatusBadge(getCampaignStatus(report.start_date, report.end_date))}
                                                </td>
                                                <td
                                                    className={`px-4 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}
                                                >
                                                    <div className='flex justify-end gap-2'>
                                                        <ActionButton
                                                            icon={
                                                                <Eye className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                            }
                                                            tooltipText='View report'
                                                            onClick={() => handleViewReport(generateSlugId(report))}
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
        </main>
    );
}
