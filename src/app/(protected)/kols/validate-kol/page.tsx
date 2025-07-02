'use client';
import React, { useEffect, useState } from 'react';
import { useFileStore } from '@/store/fileStore';
import ExcelJS from 'exceljs';
import Button from '@/components/globals/button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Fetch from '@/utilities/fetch';
import { Kol, Warning } from '@/components/icons';
import SpinnerLoader from '@/components/globals/spinner-loader';
import DataNotFound from '@/components/globals/data-not-found';
import Modal from '@/components/globals/modal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

type KOLRawRow = {
    Name: string;
    Niche: string;
    'Audience Age Range': string;
    'Audience Male (%)': string;
    'Audience Female (%)': string;
    Followers: string;
    'Engagement Rate': string;
    Reach: string;
    'Rate Card': string;
};

type KOLParsedRow = {
    name: string;
    niche: string;
    followers: number;
    engagement_rate: number;
    reach: number;
    rate_card: number;
    audience_male: number;
    audience_female: number;
    audience_age_range: string;
};

const VALID_NICHES = [
    'FASHION',
    'BEAUTY',
    'TECH',
    'PARENTING',
    'LIFESTYLE',
    'FOOD',
    'HEALTH',
    'EDUCATION',
    'FINANCIAL',
];

const VALID_AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];

export default function ValidateKOL() {
    const { file } = useFileStore();
    const [data, setData] = useState<KOLParsedRow[]>([]);
    const [errors, setErrors] = useState<Record<number, string[]>>({});
    const [loadingParse, setLoadingParse] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const router = useRouter();
    const allRowsHaveErrors = data.length > 0 && data.every((_, idx) => errors[idx]?.length > 0);

    const handleOpenConfirmation = () => {
        if (data.length === 0) {
            toast.error('No data available.');
            return;
        }

        setModalOpen(true);
    };

    const handleCancel = () => {
        router.push('/kols');
    };

    useEffect(() => {
        if (!file) {
            toast.error('Please upload a file first.');
            router.replace('/kols');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            setLoadingParse(true);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(e.target?.result as ArrayBuffer);
            const worksheet = workbook.worksheets[0];

            const parsed: KOLRawRow[] = [];
            const toPercent = (val: string | number | undefined) => {
                const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
                if (isNaN(num)) return '';
                return (num * 100).toFixed(2) + '%';
            };

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber <= 3) return;
                const v = row.values as (string | number | undefined)[];

                const nameCell = String(v[2] ?? '').trim();
                if (!nameCell) return;

                parsed.push({
                    Name: nameCell,
                    Niche: String(v[3] ?? ''),
                    'Audience Age Range': String(v[4] ?? ''),
                    'Audience Male (%)': toPercent(v[5]),
                    'Audience Female (%)': toPercent(v[6]),
                    Followers: String(v[7] ?? ''),
                    'Engagement Rate': toPercent(v[8]),
                    Reach: String(v[9] ?? ''),
                    'Rate Card': String(v[10] ?? ''),
                });
            });

            const processed: KOLParsedRow[] = [];
            const errs: Record<number, string[]> = {};

            parsed.forEach((row: KOLRawRow, i: number) => {
                const rowErrs: string[] = [];

                const name = String(row['Name'] ?? '').trim();
                const niche = String(row['Niche'] ?? '')
                    .trim()
                    .toUpperCase();
                const ageRange = String(row['Audience Age Range'] ?? '').trim();
                const maleStr = (row['Audience Male (%)'] + '').replace('%', '').replace(',', '.');
                const femaleStr = (row['Audience Female (%)'] + '').replace('%', '').replace(',', '.');
                const followersStr = (row['Followers'] + '').replace(/\D/g, '');
                const engagementStr = (row['Engagement Rate'] + '').replace('%', '').replace(',', '.');
                const reachStr = (row['Reach'] + '').replace(/\D/g, '');
                const rateCardStr = (row['Rate Card'] + '').replace(/\D/g, '');

                const male = parseFloat(maleStr) / 100;
                const female = parseFloat(femaleStr) / 100;
                const followers = parseInt(followersStr);
                const engagement = parseFloat(engagementStr);
                const reach = parseInt(reachStr);
                const rateCard = parseInt(rateCardStr);

                if (!VALID_NICHES.includes(niche)) rowErrs.push('Invalid Niche');
                if (!VALID_AGE_RANGES.includes(ageRange)) rowErrs.push('Invalid Age Range');
                if (Math.round((male + female) * 100) !== 100) rowErrs.push('Audience Male + Female ≠ 100%');
                if (isNaN(followers)) rowErrs.push('Invalid Followers');
                if (isNaN(engagement)) rowErrs.push('Invalid Engagement Rate');
                if (isNaN(reach)) rowErrs.push('Invalid Reach');
                if (isNaN(rateCard)) rowErrs.push('Invalid Rate Card');

                if (rowErrs.length > 0) errs[i] = rowErrs;

                processed.push({
                    name,
                    niche,
                    followers,
                    engagement_rate: parseFloat(engagement.toFixed(2)),
                    reach,
                    rate_card: rateCard,
                    audience_male: Math.round(male * 100),
                    audience_female: Math.round(female * 100),
                    audience_age_range: `AGE_${ageRange.replace('-', '_').replace('+', '_PLUS')}`,
                });
            });

            setData(processed);
            setErrors(errs);
            setLoadingParse(false);
        };

        reader.readAsArrayBuffer(file);
    }, [file, router]);

    const handleConfirmSave = async () => {
        if (allRowsHaveErrors) {
            toast.error('Cannot save. All rows contain errors.');
            return;
        }

        setLoadingSave(true);
        try {
            const response = await Fetch.POST(
                '/kol',
                data.filter((_, idx) => !errors[idx])
            );
            if (response.success === true) {
                toast.success(response.message);
                router.push('/kols');
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('Failed to submit KOL data');
        } finally {
            setLoadingSave(false);
            setModalOpen(false);
        }
    };

    return (
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full py-4 border-b border-gray flex flex-wrap justify-between items-center gap-3 px-6'>
                <div className='flex items-center gap-3'>
                    <Kol className='w-8 h-8 fill-dark' />
                    <span className='text-lg font-semibold'>KOLs Bulk Validation Input</span>
                </div>
                <div className='hidden md:block'>
                    <Button variant='outline' className='ml-auto' onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
            <div className='h-[calc(100vh-10rem)] overflow-y-auto py-3 px-6 space-y-3'>
                <div className='space-y-1 rounded-md border border-warning bg-warning/30 p-4'>
                    <span className='font-semibold'>Note:</span>
                    <ul className='list-disc list-inside space-y-1 pl-2'>
                        <li>
                            Please <strong>do not reload</strong> the page during the validation and review process —
                            any uploaded file will be lost if the page is refreshed.
                        </li>
                        <li>
                            You can choose to save only the valid data — any rows with errors will be skipped and not
                            saved.
                        </li>
                        <li>
                            Alternatively, you can cancel and fix the errors first to ensure all data is valid before
                            saving.
                        </li>
                    </ul>
                </div>

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
                                <th className='text-center p-4 rounded-tr-lg'>Errors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingParse ? (
                                <tr>
                                    <td colSpan={11} className='py-4 text-center'>
                                        <SpinnerLoader scale='scale-80' />
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={11}>
                                        <DataNotFound />
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => {
                                    const isLast = idx === data.length - 1;
                                    return (
                                        <tr
                                            key={idx}
                                            className={`${!isLast ? 'border-b border-gray' : ''} ${errors[idx] ? 'bg-error/30' : ''}`}
                                        >
                                            <td className={`text-center px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}>
                                                {idx + 1}
                                            </td>
                                            <td className='px-4 py-2 text-left'>{row.name}</td>
                                            <td className='px-4 py-2 text-right'>{row.niche}</td>
                                            <td className='px-4 py-2 text-right'>
                                                {row.audience_age_range.replace('AGE_', '').replace('_', ' - ')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>{row.audience_male}%</td>
                                            <td className='px-4 py-2 text-right'>{row.audience_female}%</td>
                                            <td className='px-4 py-2 text-right'>
                                                {row.followers.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>{row.engagement_rate.toFixed(2)}%</td>
                                            <td className='px-4 py-2 text-right'>
                                                {row.reach.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                Rp{row.rate_card.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 flex justify-center'>
                                                {errors[idx]?.length ? (
                                                    <>
                                                        <Warning
                                                            className='w-6 h-6 fill-error cursor-pointer'
                                                            data-tooltip-id={`error-tooltip-${idx}`}
                                                            data-tooltip-content={errors[idx].join('\n')}
                                                        />
                                                        <Tooltip
                                                            id={`error-tooltip-${idx}`}
                                                            className='max-w-sm whitespace-pre-line break-words'
                                                        />
                                                    </>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {!loadingParse && (
                    <div className='mt-3 flex justify-end gap-2'>
                        {allRowsHaveErrors ? (
                            <Button variant='outline' onClick={handleCancel}>
                                Cancel
                            </Button>
                        ) : (
                            <>
                                <Button variant='outline' onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button onClick={handleOpenConfirmation}>Save</Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <Modal
                    title='Confirm Save'
                    onClose={handleCancel}
                    footer={
                        <Button onClick={handleConfirmSave} disabled={loadingSave}>
                            {loadingSave ? 'Saving...' : 'Save'}
                        </Button>
                    }
                >
                    <div>
                        Are you sure you want to save only the valid data and skip the rows with errors?
                        <br />
                        Or do you want to go back and fix the input file first?
                    </div>
                </Modal>
            )}
        </main>
    );
}
