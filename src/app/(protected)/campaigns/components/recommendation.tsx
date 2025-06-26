import React from 'react';
import { Kols } from '@/types';
import SpinnerLoader from '@/components/globals/spinner-loader';
import DataNotFound from '@/components/globals/data-not-found';

type Props = {
    recommendedKols: Kols[];
    selectedKols: number[];
    onChange: (kolId: number, checked: boolean) => void;
    loading: boolean;
};

export default function Recommendation({ recommendedKols, selectedKols, onChange, loading }: Props) {
    return (
        <div>
            <h2 className='text-lg font-semibold mb-2'>Recommended KOLs</h2>
            <div className='overflow-auto border rounded-lg'>
                <table className='min-w-full text-sm'>
                    <thead className='border-b border-gray'>
                        <tr className='bg-primary/50'>
                            <th className='w-16 text-center p-4 rounded-tl-lg'>No</th>
                            <th className='text-center p-4'>Name</th>
                            <th className='text-center p-4'>Followers</th>
                            <th className='text-center p-4'>Engagement</th>
                            <th className='text-center p-4'>Reach</th>
                            <th className='text-center p-4'>Rate Card</th>
                            <th className='text-center p-4'>Score</th>
                            <th className='text-center p-4 rounded-tr-lg'>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={11} className='py-4 text-center'>
                                    <SpinnerLoader scale='scale-80' />
                                </td>
                            </tr>
                        ) : recommendedKols.length === 0 ? (
                            <tr>
                                <td colSpan={11}>
                                    <DataNotFound />
                                </td>
                            </tr>
                        ) : (
                            recommendedKols.map((kol, index) => {
                                const isLast = index === recommendedKols.length - 1;
                                return (
                                    <tr key={kol.id} className={`bg-light ${isLast ? '' : 'border-b border-gray'} `}>
                                        <td className={`text-center px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}>
                                            {index + 1}
                                        </td>
                                        <td className='px-4 py-2 text-left'>{kol.name}</td>
                                        <td className='px-4 py-2 text-right'>{kol.followers.toLocaleString()}</td>
                                        <td className='px-4 py-2 text-right'>{kol.engagement_rate.toFixed(2)}%</td>
                                        <td className='px-4 py-2 text-right'>{kol.reach.toLocaleString()}</td>
                                        <td className='px-4 py-2 text-right'>Rp {kol.rate_card.toLocaleString()}</td>
                                        <td className='px-4 py-2 text-right'>{kol.score}</td>
                                        <td className={`px-4 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}>
                                            <input
                                                type='checkbox'
                                                checked={selectedKols.includes(kol.id)}
                                                onChange={(e) => onChange(kol.id, e.target.checked)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
