'use client';

import { Campaigns } from '@/types';
import DataNotFound from '@/components/globals/data-not-found';

interface Props {
    campaign_kols: Campaigns['campaign_kols'];
}

export default function InvolvedKOLs({ campaign_kols }: Props) {
    return (
        <>
            <h2 className='mt-4 text-xl font-semibold'>Involved KOLs</h2>
            <div className='overflow-auto border rounded-lg'>
                <table className='min-w-full text-sm'>
                    <thead className='border-b border-gray'>
                        <tr className='bg-primary/50'>
                            <th className='w-16 text-center p-4 rounded-tl-lg'>No</th>
                            <th className='text-center p-4'>Name</th>
                            <th className='text-center p-4'>Followers</th>
                            <th className='text-center p-4'>Engagement</th>
                            <th className='text-center p-4'>Reach</th>
                            <th className='text-center p-4 rounded-tr-lg'>Rate Card</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaign_kols?.length === 0 ? (
                            <tr>
                                <td colSpan={11}>
                                    <DataNotFound />
                                </td>
                            </tr>
                        ) : (
                            campaign_kols?.map(({ kol }, index) => {
                                const isLast = index === (campaign_kols?.length ?? 0) - 1;
                                return (
                                    <tr key={kol.id} className={`bg-light ${isLast ? '' : 'border-b border-gray'}`}>
                                        <td className={`text-center px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}>
                                            {index + 1}
                                        </td>
                                        <td className='px-4 py-2 text-left'>{kol.name}</td>
                                        <td className='px-4 py-2 text-right'>
                                            {Number(kol.followers).toLocaleString('id-ID')}
                                        </td>
                                        <td className='px-4 py-2 text-right'>{kol.engagement_rate.toFixed(2)}%</td>
                                        <td className='px-4 py-2 text-right'>
                                            {Number(kol.reach).toLocaleString('id-ID')}
                                        </td>
                                        <td className={`px-4 py-2 text-right ${isLast ? 'rounded-br-lg' : ''}`}>
                                            Rp {Number(kol.rate_card).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
