'use client';

import Fetch from '@/utilities/fetch';
import { Campaigns } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import SpinnerLoader from '@/components/globals/spinner-loader';
import { Campaign } from '@/components/icons';
import { format } from 'date-fns';
import InvolvedKOLs from '@/app/(protected)/campaigns/components/involved-kols';
import Button from '@/components/globals/button';

export default function CampaignDetailPage() {
    const router = useRouter();
    const params = useParams();
    const slug_id = params?.slug_id as string;
    const id = parseInt(slug_id.split('-').pop() || '', 10);

    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<Campaigns | null>(null);

    const fetchCampaign = useCallback(async () => {
        setLoading(true);
        try {
            const response = await Fetch.GET(`/campaign/${id}`);
            setCampaign(response.data);
        } catch (error) {
            console.error('Failed to fetch campaign:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCampaign().then();
    }, [fetchCampaign]);

    if (loading) {
        return (
            <main className='pb-10 h-full flex items-center justify-center'>
                <SpinnerLoader />
            </main>
        );
    }

    if (!campaign) {
        notFound();
    }

    const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(value);

    const campaignDetails = [
        { label: 'Campaign Name', value: campaign.name },
        { label: 'Brand', value: campaign.user.username },
        {
            label: 'Kol Type',
            value: `${campaign.kol_types.name} (${formatNumber(campaign.kol_types.min_followers)} - ${formatNumber(campaign.kol_types.max_followers)})`,
        },
        { label: 'Target Niche', value: campaign.target_niche },
        { label: 'Budget per KOL', value: `Rp ${formatNumber(campaign.budget)}` },
        {
            label: 'Target Age Range',
            value: campaign.target_age_range.replace('AGE_', '').replace('_', ' - '),
        },
        { label: 'Target Engagement', value: `${campaign.target_engagement.toFixed(2)}%` },
        { label: 'Target Reach', value: formatNumber(campaign.target_reach) },
        { label: 'Target Gender', value: campaign.target_gender },
        {
            label: 'Target Gender Percentage',
            value: `${campaign.target_gender_min}%`,
        },
        {
            label: 'Start Date',
            value: format(campaign.start_date, 'dd MMM yyyy'),
        },
        {
            label: 'End Date',
            value: format(campaign.end_date, 'dd MMM yyyy'),
        },
    ];

    return (
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full py-4 border-b border-gray flex flex-wrap justify-between items-center gap-3 px-6'>
                <div className='flex items-center gap-3'>
                    <Campaign className='w-8 h-8 fill-dark' />
                    <h1 className='text-lg font-semibold'>Detail Campaign {campaign.name}</h1>
                </div>
                <div className='hidden md:block'>
                    <Button variant='outline' className='ml-auto' onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </div>

            <div className='h-[calc(100vh-10rem)] overflow-y-auto'>
                <div className='py-3 px-6 space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
                        {campaignDetails.map((item, index) => (
                            <div key={index} className='grid grid-cols-5 items-center gap-4'>
                                <span className='col-span-2 font-medium'>{item.label}</span>
                                <p className='col-span-3 input-style'>{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <InvolvedKOLs campaign_kols={campaign.campaign_kols} />
                </div>
            </div>
        </main>
    );
}
