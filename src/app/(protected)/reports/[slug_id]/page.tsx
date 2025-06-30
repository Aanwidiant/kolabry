'use client';
import { Report, Edit, Trash, Download, ReportAdd, Upload } from '@/components/icons';
import React, { useCallback, useEffect, useState } from 'react';
import Button from '@/components/globals/button';
import Fetch from '@/utilities/fetch';
import SpinnerLoader from '@/components/globals/spinner-loader';
import ActionButton from '@/components/globals/action-button';
import DataNotFound from '@/components/globals/data-not-found';
import { useParams, useRouter } from 'next/navigation';
import { Campaigns, KolReportItem } from '@/types';
import DeleteReportKol from '@/app/(protected)/reports/components/delete';
import AddReportKol from '@/app/(protected)/reports/components/add';
import EditReportKOL from '@/app/(protected)/reports/components/edit';
import useAuthStore from '@/store/authStore';
import { format } from 'date-fns';
import { startOfDay, isAfter } from 'date-fns';
import AddBulkReport from '@/app/(protected)/reports/components/add-bulk';
import { toast } from 'react-toastify';

export default function KolReportPage() {
    const role = useAuthStore((state) => state.user?.role);
    const router = useRouter();
    const params = useParams();
    const slug_id = params?.slug_id as string;
    const id = parseInt(slug_id.split('-').pop() || '', 10);
    const [campaign, setCampaign] = useState<Campaigns>();
    const [reports, setReport] = useState<KolReportItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState<KolReportItem | null>(null);
    const [selectedAdd, setSelectedAdd] = useState<{ id: number | undefined; name: string } | null>(null);
    const [selectedDelete, setSelectedDelete] = useState<{
        id: number | undefined;
        name: string;
    } | null>(null);
    const today = startOfDay(new Date());
    const endDate = startOfDay(new Date(campaign?.end_date || ''));
    const isAfterEnd = isAfter(today, endDate);
    const [openAddBulk, setOpenAddBulk] = useState(false);

    const getReportCampaign = useCallback(async () => {
        setLoading(true);
        try {
            const response = await Fetch.GET(`/report/${id}`);
            setCampaign(response.campaign);
            setReport(response.data || []);
        } catch (error) {
            console.error('Error fetching Report:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleExportExcel = async () => {
        if (!id) return;
        const res = await Fetch.DOWNLOAD(`/report/export/${id}`, `${campaign?.name}_report.xlsx`);
        if (!res.success) {
            toast.error(res.message);
        }
    };

    useEffect(() => {
        getReportCampaign().then();
    }, [getReportCampaign]);

    if (loading) {
        return (
            <main className='pb-10 h-full flex items-center justify-center'>
                <SpinnerLoader />
            </main>
        );
    }

    function formatNumber(value: number | null | undefined) {
        return value != null ? Number(value).toLocaleString('id-ID') : '-';
    }

    const campaignDetails = [
        { label: 'Campaign Name', value: campaign?.name },
        { label: 'Brand', value: campaign?.user.username },
        {
            label: 'Kol Type',
            value: `${campaign?.kol_types.name} (${formatNumber(campaign?.kol_types.min_followers)} - ${formatNumber(campaign?.kol_types.max_followers)})`,
        },
        { label: 'Target Niche', value: campaign?.target_niche },
        { label: 'Budget per KOL', value: `Rp ${formatNumber(campaign?.budget)}` },
        {
            label: 'Target Age Range',
            value: campaign?.target_age_range.replace('AGE_', '').replace('_', ' - '),
        },
        { label: 'Target Engagement', value: `${campaign?.target_engagement.toFixed(2)}%` },
        { label: 'Target Reach', value: formatNumber(campaign?.target_reach) },
        { label: 'Target Gender', value: campaign?.target_gender },
        {
            label: 'Target Gender Percentage',
            value: `${campaign?.target_gender_min}%`,
        },
        {
            label: 'Start Date',
            value: campaign?.start_date ? format(campaign.start_date, 'dd MMM yyyy') : '-',
        },
        {
            label: 'End Date',
            value: campaign?.end_date ? format(campaign.end_date, 'dd MMM yyyy') : '-',
        },
    ];

    return (
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full py-4 border-b border-gray flex flex-wrap justify-between items-center gap-3 px-6'>
                <div className='flex items-center gap-3'>
                    <Report className='w-8 h-8 fill-dark' />
                    <h1 className='text-lg font-semibold'>Report Campaign {campaign?.name}</h1>
                </div>
                <div className='hidden md:block'>
                    <Button variant='outline' className='ml-auto ' onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
            <div className='h-[calc(100vh-10rem)] overflow-y-auto'>
                <div className='py-3 px-6 flex gap-3 flex-wrap justify-between items-center'>
                    <h2 className='text-xl font-semibold'>Campaign Overview</h2>
                    {isAfterEnd && (
                        <div className='flex items-center gap-3 place-self-end'>
                            {role === 'KOL_MANAGER' && (
                                <Button onClick={() => setOpenAddBulk(true)}>
                                    <Upload className='w-6 h-6' />
                                    <p>Add Bulk</p>
                                </Button>
                            )}
                            <Button onClick={() => handleExportExcel()}>
                                <Download className='w-6 h-6' />
                                <p>Report</p>
                            </Button>
                        </div>
                    )}
                </div>
                <div className='py-3 px-6 space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pb-4'>
                        {campaignDetails.map((item, index) => (
                            <div key={index} className='grid grid-cols-5 items-center gap-4'>
                                <span className='col-span-2 font-medium'>{item.label}</span>
                                <p className='col-span-3 input-style bg-primary/15'>{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <h2 className='text-xl font-semibold'>Report Involved KOLs</h2>
                    <div className='overflow-x-auto rounded-lg border border-gray'>
                        <table className='min-w-full text-sm'>
                            <thead className='border-b border-gray'>
                                <tr className='bg-primary/50'>
                                    <th className='w-16 text-center p-4 rounded-tl-lg'>No</th>
                                    <th className='text-center min-w-32 p-4'>Name</th>
                                    <th className='text-center p-4'>Like</th>
                                    <th className='text-center p-4'>Comment</th>
                                    <th className='text-center p-4'>Share</th>
                                    <th className='text-center p-4'>Save</th>
                                    <th className='text-center p-4'>Reach</th>
                                    <th className='text-center p-4'>Cost</th>
                                    <th className='text-center p-4'>ER</th>
                                    <th className='text-center p-4'>CPE</th>
                                    <th className='text-center p-4'>Ranking</th>
                                    {role === 'KOL_MANAGER' && (
                                        <th className='text-center p-4 rounded-tr-lg'>Action</th>
                                    )}
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
                                                key={report.kol_id}
                                                className={`bg-light ${isLast ? '' : 'border-b border-gray'} `}
                                            >
                                                <td className={`text-center px-4 py-2`}>{index + 1}</td>
                                                <td className='px-4 py-2 text-left'>{report.kol_name}</td>
                                                <td className='px-4 py-2 text-right'>
                                                    {formatNumber(report.report?.like_count)}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {formatNumber(report.report?.comment_count)}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {formatNumber(report.report?.share_count)}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {formatNumber(report.report?.save_count)}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {formatNumber(report.report?.reach)}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {report.report?.cost != null
                                                        ? `Rp ${formatNumber(report.report.cost)}`
                                                        : '-'}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {report.report?.er != null
                                                        ? `${formatNumber(report.report.er)}%`
                                                        : '-'}
                                                </td>
                                                <td className='px-4 py-2 text-right'>
                                                    {report.report?.cpe != null
                                                        ? `Rp ${formatNumber(report.report.cpe)}`
                                                        : '-'}
                                                </td>
                                                <td className='px-4 py-2 text-center'>
                                                    {formatNumber(report.report?.ranking)}
                                                </td>
                                                {role === 'KOL_MANAGER' && (
                                                    <td className={`px-4 py-2 text-center w-fit`}>
                                                        {isAfterEnd ? (
                                                            <div className='flex justify-center gap-2'>
                                                                {!report.report && (
                                                                    <ActionButton
                                                                        icon={
                                                                            <ReportAdd className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                                        }
                                                                        onClick={() =>
                                                                            setSelectedAdd({
                                                                                id: report.kol_id,
                                                                                name: report.kol_name,
                                                                            })
                                                                        }
                                                                        tooltipText='Add'
                                                                    />
                                                                )}
                                                                {report.report && (
                                                                    <>
                                                                        <ActionButton
                                                                            icon={
                                                                                <Edit className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                                            }
                                                                            onClick={() => setSelectedEdit(report)}
                                                                            tooltipText='Edit'
                                                                        />
                                                                        <ActionButton
                                                                            icon={
                                                                                <Trash className='w-6 h-6 fill-error' />
                                                                            }
                                                                            onClick={() =>
                                                                                setSelectedDelete({
                                                                                    id: report.report.id,
                                                                                    name: report.kol_name,
                                                                                })
                                                                            }
                                                                            tooltipText='Delete'
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className='whitespace-nowrap px-2 py-1 rounded-md text-xs font-semibold bg-warning text-dark'>
                                                                Not done yet
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {selectedAdd && (
                <AddReportKol
                    kolId={selectedAdd.id}
                    kolName={selectedAdd.name}
                    campaignId={campaign?.id}
                    onClose={() => setSelectedAdd(null)}
                    onAdd={getReportCampaign}
                />
            )}
            <EditReportKOL
                reportData={selectedEdit}
                onClose={() => setSelectedEdit(null)}
                onUpdate={getReportCampaign}
            />
            {selectedDelete && (
                <DeleteReportKol
                    reportId={selectedDelete.id}
                    name={selectedDelete.name}
                    onClose={() => setSelectedDelete(null)}
                    onDelete={getReportCampaign}
                />
            )}
            {openAddBulk && (
                <AddBulkReport
                    onClose={() => setOpenAddBulk(false)}
                    campaign_id={campaign?.id}
                    campaign_name={campaign?.name}
                />
            )}
        </main>
    );
}
