'use client';
import React, { useEffect, useState } from 'react';
import { useFileStore } from '@/store/fileStore';
import ExcelJS from 'exceljs';
import Button from '@/components/globals/button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Fetch from '@/utilities/fetch';
import { Report, Warning } from '@/components/icons';
import SpinnerLoader from '@/components/globals/spinner-loader';
import DataNotFound from '@/components/globals/data-not-found';
import Modal from '@/components/globals/modal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import slugify from 'slugify';

type ReportRawRow = {
    No: string;
    'KOL Code': string;
    'KOL Name': string;
    Like: string;
    Comment: string;
    Share: string;
    Save: string;
    Cost: string;
    Reach: string;
};

type ReportParsedRow = {
    campaign_id: number;
    kol_id: number;
    kol_name: string;
    like_count: number;
    comment_count: number;
    share_count: number;
    save_count: number;
    reach: number;
    cost: number;
};

type ReportPayload = Omit<ReportParsedRow, 'kol_name'>;

export default function ValidateReportPerformance() {
    const { file } = useFileStore();
    const [data, setData] = useState<ReportParsedRow[]>([]);
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
        router.push('/reports');
    };

    useEffect(() => {
        if (!file) {
            toast.error('Please upload a file first.');
            router.replace('/reports');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            setLoadingParse(true);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(e.target?.result as ArrayBuffer);
            const worksheet = workbook.worksheets[0];

            const campaignCodeRow = worksheet.getRow(2);
            const campaignCode = campaignCodeRow.getCell(1).value?.toString() || '';
            const parts = campaignCode.split('-');
            const campaign_id = parseInt(parts[parts.length - 1]);

            const parsed: ReportRawRow[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber <= 4) return;
                const v = row.values as (string | number | undefined)[];

                const kolCodeCell = String(v[2] ?? '').trim();
                if (!kolCodeCell) return;

                parsed.push({
                    No: String(v[1] ?? ''),
                    'KOL Code': kolCodeCell,
                    'KOL Name': String(v[3] ?? ''),
                    Like: String(v[4] ?? ''),
                    Comment: String(v[5] ?? ''),
                    Share: String(v[6] ?? ''),
                    Save: String(v[7] ?? ''),
                    Cost: String(v[8] ?? '').replace(/\D/g, ''),
                    Reach: String(v[9] ?? '').replace(/\D/g, ''),
                });
            });

            const processed: ReportParsedRow[] = [];
            const errs: Record<number, string[]> = {};

            parsed.forEach((row: ReportRawRow, i: number) => {
                const rowErrs: string[] = [];

                const kolSlug = slugify(row['KOL Code'], {
                    replacement: '-',
                    remove: /[*+~.()'"!:@]/g,
                    lower: false,
                });
                const kolIdMatch = kolSlug.match(/KOL-(\d+)/i);
                const kolId = kolIdMatch ? parseInt(kolIdMatch[1]) : 0;

                const likeCount = parseInt(row.Like.replace(/\D/g, '')) || 0;
                const commentCount = parseInt(row.Comment.replace(/\D/g, '')) || 0;
                const shareCount = parseInt(row.Share.replace(/\D/g, '')) || 0;
                const saveCount = parseInt(row.Save.replace(/\D/g, '')) || 0;
                const cost = parseInt(row.Cost) || 0;
                const reach = parseInt(row.Reach) || 0;

                if (kolId <= 0) rowErrs.push('Invalid KOL ID');
                if (isNaN(likeCount)) rowErrs.push('Invalid Like count');
                if (isNaN(commentCount)) rowErrs.push('Invalid Comment count');
                if (isNaN(shareCount)) rowErrs.push('Invalid Share count');
                if (isNaN(saveCount)) rowErrs.push('Invalid Save count');
                if (isNaN(cost)) rowErrs.push('Invalid Cost');
                if (isNaN(reach)) rowErrs.push('Invalid Reach');

                if (rowErrs.length > 0) errs[i] = rowErrs;

                processed.push({
                    campaign_id: campaign_id,
                    kol_id: kolId,
                    kol_name: row['KOL Name'],
                    like_count: likeCount,
                    comment_count: commentCount,
                    share_count: shareCount,
                    save_count: saveCount,
                    reach: reach,
                    cost: cost,
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

        setModalOpen(false);
        setLoadingSave(true);
        try {
            const payload: ReportPayload[] = data
                .filter((_, idx) => !errors[idx])
                .map((row) => ({
                    campaign_id: row.campaign_id,
                    kol_id: row.kol_id,
                    like_count: row.like_count,
                    comment_count: row.comment_count,
                    share_count: row.share_count,
                    save_count: row.save_count,
                    reach: row.reach,
                    cost: row.cost,
                }));

            const response = await Fetch.POST('/report', payload);

            if (response.success === true) {
                toast.success(response.message);
                router.push('/reports');
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('Failed to submit campaign performance data');
        } finally {
            setLoadingSave(false);
        }
    };

    return (
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full py-4 border-b border-gray flex flex-wrap justify-between items-center gap-3 px-6'>
                <div className='flex items-center gap-3'>
                    <Report className='w-8 h-8 fill-dark' />
                    <span className='text-lg font-semibold'>Report Bulk Validation Input</span>
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
                            Please do not alter the structure of the template file. Each campaign has a unique template,
                            and reports must be adjusted accordingly. Make sure you are using the most up-to-date
                            version of the template.
                        </li>
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
                                <th className='text-center min-w-32 p-4'>KOL Code</th>
                                <th className='text-center p-4'>KOL Name</th>
                                <th className='text-center p-4'>Like</th>
                                <th className='text-center p-4'>Comment</th>
                                <th className='text-center p-4'>Share</th>
                                <th className='text-center p-4'>Save</th>
                                <th className='text-center p-4'>Cost</th>
                                <th className='text-center p-4 '>Reach</th>
                                <th className='text-center p-4 rounded-tr-lg'>Errors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingParse ? (
                                <tr>
                                    <td colSpan={10} className='py-4 text-center'>
                                        <SpinnerLoader scale='scale-80' />
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={10}>
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
                                            <td className='px-4 py-2 text-left'>
                                                KOL-{row.kol_id.toString().padStart(3, '0')}
                                            </td>
                                            <td className='px-4 py-2 text-left'>{row.kol_name}</td>
                                            <td className='px-4 py-2 text-right'>
                                                {row.like_count.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                {row.comment_count.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                {row.share_count.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                {row.save_count.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                Rp{row.cost.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                {row.reach.toLocaleString('id-ID')}
                                            </td>
                                            <td className='px-4 py-2 flex justify-center'>
                                                {errors[idx]?.length ? (
                                                    <>
                                                        <Warning
                                                            className='w-6 h-6 fill-error cursor-pointer'
                                                            data-tooltip-id={`error-tooltip-${idx}`}
                                                            data-tooltip-content={errors[idx].join(', ')}
                                                        />
                                                        <Tooltip id={`error-tooltip-${idx}`} place='top' />
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
