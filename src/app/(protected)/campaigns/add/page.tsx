'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Fetch from '@/utilities/fetch';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import { Campaigns } from '@/types';
import { Campaign } from '@/components/icons';
import SingleSelect from '@/components/globals/single-select';
import { ageRangeOptions, genderTypeOptions, nicheTypeOptions } from '@/constants/option';
import { AgeRangeType, GenderType, NicheType } from '@prisma/client';
import { NumericFormat } from 'react-number-format';
import Calendar from 'react-calendar';
import { format } from 'date-fns';

export default function AddCampaignPage() {
    const [formData, setFormData] = useState<Partial<Campaigns>>({});
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
            setFormData((prev) => ({ ...prev, target_niche: value as NicheType }));
        }
    };

    const handleGenderChange = (value: string | number | null) => {
        if (typeof value === 'string' && ['MALE', 'FEMALE'].includes(value)) {
            setFormData((prev) => ({ ...prev, target_gender: value as GenderType }));
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

    const handleNumberValueChange =
        (field: keyof typeof formData) =>
        ({ value }: { value: string }) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value === '' ? null : parseFloat(value),
            }));
        };

    const handlePercentageChange = (
        field: keyof Campaigns,
        setFormData: React.Dispatch<React.SetStateAction<Partial<Campaigns>>>
    ) => {
        return ({ floatValue }: { floatValue?: number }) => {
            setFormData((prev) => ({
                ...prev,
                [field]: floatValue ?? 0,
            }));
        };
    };

    const handleDateChange = (key: 'start_date' | 'end_date', value: Date) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleAdd = async () => {
        if (!formData.name) {
            toast.error('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const response = await Fetch.POST('/campaign', formData);
            if (response.success === true) {
                toast.success(response.message);
                router.push('/campaigns');
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('Failed to create Campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className='pb-10'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Campaign className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Create New Campaign</span>
            </div>

            <div className='py-3 px-6 space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
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
                        <label className='col-span-2 font-medium' htmlFor='kol_type'>
                            Kol Type
                        </label>
                        <input
                            className='col-span-3 input-style'
                            id='kol_type'
                            name='kol_type'
                            type='text'
                            value={formData.name ?? ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='grid grid-cols-5 items-center gap-4'>
                        <label className='col-span-2 font-medium' htmlFor='target_niche'>
                            Target Niche
                        </label>
                        <div className='col-span-3'>
                            <SingleSelect
                                id='target_niche'
                                options={nicheTypeOptions}
                                value={formData.target_niche ?? null}
                                onChange={handleNicheChange}
                                width='w-full'
                                allowClear={false}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-5 items-center gap-4'>
                        <label className='col-span-2 font-medium' htmlFor='rate_card'>
                            Target Rate Card
                        </label>
                        <NumericFormat
                            id='rate_card'
                            name='rate_card'
                            className='col-span-3 input-style'
                            value={formData.target_rate_card ?? ''}
                            thousandSeparator='.'
                            decimalSeparator=','
                            prefix='Rp '
                            allowNegative={false}
                            allowLeadingZeros={false}
                            onValueChange={handleNumberValueChange('target_rate_card')}
                        />
                    </div>
                    <div className='grid grid-cols-5 items-center gap-4'>
                        <label className='col-span-2 font-medium' htmlFor='target_engagement'>
                            Target Engagement
                        </label>
                        <NumericFormat
                            id='target_engagement'
                            name='target_engagement'
                            className='col-span-3 input-style'
                            value={formData.target_engagement}
                            suffix='%'
                            decimalScale={2}
                            onValueChange={handlePercentageChange('target_engagement', setFormData)}
                        />
                    </div>
                    <div className='grid grid-cols-5 items-center gap-4'>
                        <label className='col-span-2 font-medium' htmlFor='target_reach'>
                            Target Reach
                        </label>
                        <NumericFormat
                            id='target_reach'
                            name='target_reach'
                            className='col-span-3 input-style'
                            value={formData.target_reach}
                            allowNegative={false}
                            allowLeadingZeros={false}
                            thousandSeparator='.'
                            decimalSeparator=','
                            onValueChange={handleNumberValueChange('target_reach')}
                        />
                    </div>
                    <div className='grid grid-cols-5 items-center gap-4'>
                        <label className='col-span-2 font-medium' htmlFor='target_gender'>
                            Target Gender
                        </label>
                        <div className='col-span-3'>
                            <SingleSelect
                                id='target_gender'
                                options={genderTypeOptions}
                                value={formData.target_gender ?? null}
                                onChange={handleGenderChange}
                                width='w-full'
                                allowClear={false}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-5 items-center gap-4'>
                        <label className='col-span-2 font-medium' htmlFor='target_gender_min'>
                            Target Gender Percentage
                        </label>
                        <NumericFormat
                            id='target_gender_min'
                            name='target_gender_min'
                            className='col-span-3 input-style'
                            value={formData.target_gender_min}
                            onValueChange={handlePercentageChange('target_gender_min', setFormData)}
                            suffix='%'
                            decimalScale={0}
                            allowNegative={false}
                            isAllowed={({ floatValue }) => (floatValue ?? 0) <= 100}
                        />
                    </div>
                    <div className='grid grid-cols-5 items-center gap-4'>
                        <label className='col-span-2 font-medium' htmlFor='target_age_range'>
                            Target Age Range
                        </label>
                        <div className='col-span-3'>
                            <SingleSelect
                                id='target_age_range'
                                options={ageRangeOptions}
                                value={formData.target_age_range ?? null}
                                onChange={handleAgeRangeChange}
                                width='w-full'
                                allowClear={false}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-5 items-start gap-4 relative'>
                        <label className='col-span-2 font-medium'>Start Date</label>
                        <div className='col-span-3 w-full'>
                            <input
                                type='text'
                                readOnly
                                onClick={() => setShowStartCalendar((prev) => !prev)}
                                value={formData.start_date ? format(new Date(formData.start_date), 'yyyy-MM-dd') : ''}
                                className='input-style w-full cursor-pointer'
                            />
                            {showStartCalendar && (
                                <div className='absolute z-10 mt-2'>
                                    <Calendar
                                        onChange={(date) => {
                                            handleDateChange('start_date', date as Date);
                                            setShowStartCalendar(false);
                                        }}
                                        value={formData.start_date ? new Date(formData.start_date) : null}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='grid grid-cols-5 items-start gap-4 relative mt-4'>
                        <label className='col-span-2 font-medium'>End Date</label>
                        <div className='col-span-3 w-full'>
                            <input
                                type='text'
                                readOnly
                                onClick={() => setShowEndCalendar((prev) => !prev)}
                                value={formData.end_date ? format(new Date(formData.end_date), 'yyyy-MM-dd') : ''}
                                className='input-style w-full cursor-pointer'
                            />
                            {showEndCalendar && (
                                <div className='absolute z-10 mt-2'>
                                    <Calendar
                                        onChange={(date) => {
                                            handleDateChange('end_date', date as Date);
                                            setShowEndCalendar(false);
                                        }}
                                        value={formData.end_date ? new Date(formData.end_date) : null}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Button className='w-fit'>Get KOL Recommendation</Button>
                <div className='mt-6 flex justify-end gap-2'>
                    <Button variant='outline' onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </Button>
                </div>
            </div>
        </main>
    );
}
