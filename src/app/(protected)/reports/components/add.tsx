import React, { useState } from 'react';
import Fetch from '@/utilities/fetch';
import { Add } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { KolReport } from '@/types';
import { NumericFormat } from 'react-number-format';

interface Props {
    campaignId: number | undefined;
    kolId: number | undefined;
    kolName: string;
    onClose: () => void;
    onAdd: () => void;
}

export default function AddReportKol({ campaignId, kolId, kolName, onClose, onAdd }: Props) {
    const [formData, setFormData] = useState<Partial<KolReport>>({});
    const [loading, setLoading] = useState(false);

    const handleNumberValueChange =
        (field: keyof typeof formData) =>
        ({ value }: { value: string }) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value === '' ? null : parseFloat(value),
            }));
        };

    const handleAdd = async () => {
        setLoading(true);

        const payload = {
            ...formData,
            kol_id: kolId,
            campaign_id: campaignId,
        };

        try {
            const response = await Fetch.POST('/report', payload);
            if (response.success === true) {
                toast.success(response.message);
                onAdd();
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('Failed to create Report KOL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            icon={<Add className='w-8 h-8 fill-dark' />}
            title='Add KOL Report'
            footer={
                <Button onClick={handleAdd} disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                </Button>
            }
        >
            <div className='grid gap-4'>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <span className='col-span-2 font-medium'>KOL Name</span>
                    <p className='col-span-3 input-style bg-primary/15'>{kolName}</p>
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='like_count'>
                        Like Count
                    </label>
                    <NumericFormat
                        id='like_count'
                        name='like_count'
                        className='col-span-3 input-style'
                        value={formData.like_count ?? ''}
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
                        value={formData.comment_count ?? null}
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
                        value={formData.share_count ?? null}
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
                        value={formData.save_count ?? null}
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
                        value={formData.reach ?? null}
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
                        value={formData.cost ?? null}
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
