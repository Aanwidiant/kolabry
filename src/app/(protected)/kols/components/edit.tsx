import React, { useEffect, useState } from 'react';
import Fetch from '@/utilities/fetch';
import { Edit } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { Kols } from '@/types';
import SingleSelect from '@/components/globals/single-select';
import { ageRangeOptions, nicheTypeOptions } from '@/constants/option';
import { AgeRangeType, NicheType } from '@prisma/client';
import { NumericFormat } from 'react-number-format';

interface EditKolProps {
    kolData: Kols | null;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditKol({ kolData: initialKolData, onClose, onUpdate }: EditKolProps) {
    const [formData, setFormData] = useState<Partial<Kols>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialKolData) {
            setFormData({
                ...initialKolData,
                followers: Number(initialKolData.followers),
                rate_card: Number(initialKolData.rate_card),
            });
        }
    }, [initialKolData]);

    if (!initialKolData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleNumberValueChange =
        (field: keyof typeof formData) =>
        ({ value }: { value: string }) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value === '' ? null : parseFloat(value),
            }));
        };

    const handlePercentageChange = (
        field: keyof Kols,
        setFormData: React.Dispatch<React.SetStateAction<Partial<Kols>>>
    ) => {
        return ({ floatValue }: { floatValue?: number }) => {
            setFormData((prev) => ({
                ...prev,
                [field]: floatValue ?? 0,
            }));
        };
    };

    const handleNicheChange = (value: string | number | null) => {
        if (
            typeof value === 'string' &&
            [
                'FASHION',
                'BEAUTY',
                'TECH',
                'PARENTING',
                'LIFESTYLE',
                'FOOD',
                'HEALTH',
                'EDUCATION',
                'FINANCIAL',
            ].includes(value)
        ) {
            setFormData((prev) => ({ ...prev, niche: value as NicheType }));
        }
    };

    const handleAgeRangeChange = (value: string | number | null) => {
        if (
            typeof value === 'string' &&
            ['AGE_13_17', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_54', 'AGE_55_PLUS'].includes(value)
        ) {
            setFormData((prev) => ({ ...prev, audience_age_range: value as AgeRangeType }));
        }
    };

    const handleSave = async () => {
        if (!formData.id) return;
        setLoading(true);

        const payload = { ...formData };
        try {
            const response = await Fetch.PATCH(`/kol/${formData.id}`, payload);
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
            toast.error('Error updating KOL.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            icon={<Edit className='w-8 h-8 fill-dark' />}
            title='Edit KOL'
            footer={
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                </Button>
            }
        >
            <div className='grid gap-4'>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='name'>
                        Name
                    </label>
                    <input
                        className='col-span-3 input-style'
                        id='name'
                        name='name'
                        type='text'
                        value={formData.name ?? ''}
                        onChange={handleChange}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='niche'>
                        Niche
                    </label>
                    <div className='col-span-3'>
                        <SingleSelect
                            id='niche'
                            options={nicheTypeOptions}
                            value={formData.niche ?? null}
                            onChange={handleNicheChange}
                            width='w-full'
                            allowClear={false}
                        />
                    </div>
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='audience_age_range'>
                        Audience Age Range
                    </label>
                    <div className='col-span-3'>
                        <SingleSelect
                            id='audience_age_range'
                            options={ageRangeOptions}
                            value={formData.audience_age_range ?? null}
                            onChange={handleAgeRangeChange}
                            width='w-full'
                            allowClear={false}
                        />
                    </div>
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='audience_male'>
                        Audience Male
                    </label>
                    <NumericFormat
                        id='audience_male'
                        name='audience_male'
                        className='col-span-3 input-style'
                        value={formData.audience_male}
                        onValueChange={handlePercentageChange('audience_male', setFormData)}
                        suffix='%'
                        decimalScale={0}
                        allowNegative={false}
                        isAllowed={({ floatValue }) => (floatValue ?? 0) <= 100}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='audience_female'>
                        Audience Female
                    </label>
                    <NumericFormat
                        id='audience_female'
                        name='audience_female'
                        className='col-span-3 input-style'
                        value={formData.audience_female}
                        onValueChange={handlePercentageChange('audience_female', setFormData)}
                        suffix='%'
                        decimalScale={0}
                        allowNegative={false}
                        isAllowed={({ floatValue }) => (floatValue ?? 0) <= 100}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='followers'>
                        Followers
                    </label>
                    <NumericFormat
                        id='followers'
                        name='followers'
                        className='col-span-3 input-style'
                        value={formData.followers}
                        allowNegative={false}
                        allowLeadingZeros={false}
                        thousandSeparator='.'
                        decimalSeparator=','
                        onValueChange={handleNumberValueChange('followers')}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='engagement_rate'>
                        Engagement Rate
                    </label>
                    <NumericFormat
                        id='engagement_rate'
                        name='engagement_rate'
                        className='col-span-3 input-style'
                        value={formData.engagement_rate}
                        suffix='%'
                        decimalScale={2}
                        onValueChange={handlePercentageChange('engagement_rate', setFormData)}
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
                        value={formData.reach}
                        allowNegative={false}
                        allowLeadingZeros={false}
                        thousandSeparator='.'
                        decimalSeparator=','
                        onValueChange={handleNumberValueChange('reach')}
                    />
                </div>
                <div className='grid grid-cols-5 items-center gap-4'>
                    <label className='col-span-2 font-medium' htmlFor='rate_card'>
                        Rate Card
                    </label>
                    <NumericFormat
                        id='rate_card'
                        name='rate_card'
                        className='col-span-3 input-style'
                        value={formData.rate_card}
                        thousandSeparator='.'
                        decimalSeparator=','
                        prefix='Rp '
                        allowNegative={false}
                        allowLeadingZeros={false}
                        onValueChange={handleNumberValueChange('rate_card')}
                    />
                </div>
            </div>
        </Modal>
    );
}
