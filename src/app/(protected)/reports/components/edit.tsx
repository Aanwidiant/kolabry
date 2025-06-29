import React, { useEffect, useState } from 'react';
import Fetch from '@/utilities/fetch';
import { Edit } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { KolReportItem } from '@/types';
import { NumericFormat } from 'react-number-format';

interface Props {
    reportData: KolReportItem | null;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditReportKOL({ reportData: initialReportData, onClose, onUpdate }: Props) {
    const [formData, setFormData] = useState<Partial<KolReportItem>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialReportData) {
            setFormData({
                ...initialReportData,
                report: {
                    ...initialReportData.report,
                    like_count: Number(initialReportData.report.like_count),
                    comment_count: Number(initialReportData.report.comment_count),
                    share_count: Number(initialReportData.report.share_count),
                    save_count: Number(initialReportData.report.save_count),
                    reach: Number(initialReportData.report.reach),
                    cost: Number(initialReportData.report.cost),
                },
            });
        }
    }, [initialReportData]);

    if (!initialReportData) return null;

    const handleNumberValueChange =
        (field: keyof NonNullable<KolReportItem['report']>) =>
        ({ value }: { value: string }) => {
            setFormData((prev) => ({
                ...prev,
                report: {
                    ...prev.report,
                    [field]: value === '' ? null : parseFloat(value),
                },
            }));
        };

    const handleSave = async () => {
        if (!formData.report?.id) return;
        setLoading(true);

        const payload = {
            like_count: formData.report?.like_count,
            comment_count: formData.report?.comment_count,
            share_count: formData.report?.share_count,
            save_count: formData.report?.save_count,
            reach: formData.report?.reach,
            cost: formData.report?.cost,
        };

        try {
            const response = await Fetch.PATCH(`/report/${formData.report?.id}`, payload);
            if (response.success === true) {
                toast.success(response.message);
                onUpdate();
                onClose();
            } else if (response.error === 'no_change') {
                toast.info(response.message);
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('Error updating KOL Report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            icon={<Edit className='w-8 h-8 fill-dark' />}
            title='Edit KOL Report'
            footer={
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                </Button>
            }
        >
            <div className='grid gap-4'>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <span className='col-span-2 font-medium'>KOL Name</span>
                    <p className='col-span-3 input-style bg-primary/15'>{formData.kol_name}</p>
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='like_count'>
                        Like Count
                    </label>
                    <NumericFormat
                        id='like_count'
                        name='like_count'
                        className='col-span-3 input-style'
                        value={formData.report?.like_count ?? ''}
                        allowNegative={false}
                        allowLeadingZeros={false}
                        thousandSeparator='.'
                        decimalSeparator=','
                        onValueChange={handleNumberValueChange('like_count')}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='comment_count'>
                        Comment Count
                    </label>
                    <NumericFormat
                        id='comment_count'
                        name='comment_count'
                        className='col-span-3 input-style'
                        value={formData.report?.comment_count ?? null}
                        allowNegative={false}
                        allowLeadingZeros={false}
                        thousandSeparator='.'
                        decimalSeparator=','
                        onValueChange={handleNumberValueChange('comment_count')}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='share_count'>
                        Share Count
                    </label>
                    <NumericFormat
                        id='share_count'
                        name='share_count'
                        className='col-span-3 input-style'
                        value={formData.report?.share_count ?? null}
                        allowNegative={false}
                        allowLeadingZeros={false}
                        thousandSeparator='.'
                        decimalSeparator=','
                        onValueChange={handleNumberValueChange('share_count')}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='save_count'>
                        Save Count
                    </label>
                    <NumericFormat
                        id='save_count'
                        name='save_count'
                        className='col-span-3 input-style'
                        value={formData.report?.save_count ?? null}
                        allowNegative={false}
                        allowLeadingZeros={false}
                        thousandSeparator='.'
                        decimalSeparator=','
                        onValueChange={handleNumberValueChange('save_count')}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='reach'>
                        Reach
                    </label>
                    <NumericFormat
                        id='reach'
                        name='reach'
                        className='col-span-3 input-style'
                        value={formData.report?.reach ?? null}
                        allowNegative={false}
                        allowLeadingZeros={false}
                        thousandSeparator='.'
                        decimalSeparator=','
                        onValueChange={handleNumberValueChange('reach')}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='cost'>
                        Cost
                    </label>
                    <NumericFormat
                        id='cost'
                        name='cost'
                        className='col-span-3 input-style'
                        value={formData.report?.cost ?? null}
                        thousandSeparator='.'
                        decimalSeparator=','
                        prefix='Rp '
                        allowNegative={false}
                        allowLeadingZeros={false}
                        onValueChange={handleNumberValueChange('cost')}
                    />
                </div>
            </div>
        </Modal>
    );
}
