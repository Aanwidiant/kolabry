'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Fetch from '@/utilities/fetch';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import { Campaigns, Kols, KolType, User } from '@/types';
import { Campaign } from '@/components/icons';
import SingleSelect from '@/components/globals/single-select';
import { ageRangeOptions, genderTypeOptions, nicheTypeOptions } from '@/constants/option';
import { AgeRangeType, GenderType, NicheType } from '@prisma/client';
import { NumericFormat } from 'react-number-format';
import CustomDatePicker from '@/components/globals/custom-date-picker';
import Recommendation from '@/app/(protected)/campaigns/components/recommendation';

export default function AddCampaignPage() {
    const [kolTypes, setKolTypes] = useState<{ label: string; value: string }[]>([]);
    const [brand, setBrand] = useState<{ label: string; value: string }[]>([]);
    const [formData, setFormData] = useState<Partial<Campaigns>>({});
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [recommendedKols, setRecommendedKols] = useState<Kols[]>([]);
    const [fetchingRecommendations, setFetchingRecommendations] = useState(false);
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
            setFormData((prev) => ({ ...prev, target_age_range: value as AgeRangeType }));
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

    const handleSelectKol = (kolId: number, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            kol_ids: checked ? [...(prev.kol_ids || []), kolId] : (prev.kol_ids || []).filter((id) => id !== kolId),
        }));
    };

    useEffect(() => {
        fetchKolTypes().then();
        fetchBrand().then();
    }, []);

    useEffect(() => {
        console.log('Current Kol Type ID:', formData.kol_type_id);
    }, [formData.kol_type_id]);

    const fetchKolTypes = async () => {
        try {
            const res = await Fetch.GET('/kol-type?noPagination=true');
            if (res.success) {
                const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(value);
                const options = res.data.map((item: KolType) => {
                    const followersRange = item.max_followers
                        ? `${formatNumber(item.min_followers)} - ${formatNumber(item.max_followers)}`
                        : `${formatNumber(item.min_followers)}+`;

                    return {
                        label: `${item.name} (${followersRange})`,
                        value: item.id.toString(),
                    };
                });
                setKolTypes(options);
            }
        } catch (error) {
            console.error('Failed to fetch KOL types:', error);
        }
    };

    const fetchBrand = async () => {
        try {
            const res = await Fetch.GET('/user?role=BRAND&noPagination=true');
            if (res.success) {
                const options = res.data.map((item: User) => {
                    return {
                        label: `${item.username}`,
                        value: item.id.toString(),
                    };
                });
                setBrand(options);
            }
        } catch (error) {
            console.error('Failed to fetch user brand:', error);
        }
    };

    const fetchRecommendations = async () => {
        setFetchingRecommendations(true);
        try {
            const requestBody = {
                kol_type_id: formData.kol_type_id,
                budget: formData.budget,
                target_niche: formData.target_niche,
                target_engagement: formData.target_engagement,
                target_reach: formData.target_reach,
                target_gender: formData.target_gender,
                target_gender_min: formData.target_gender_min,
                target_age_range: formData.target_age_range,
            };

            const res = await Fetch.POST('/kol/recommendation', requestBody);

            if (res.success) {
                setRecommendedKols(res.data || []);
                if (!res.data || res.data.length === 0) {
                    toast.info('No KOLs match your criteria');
                }
            } else {
                toast.error(res.message || 'Failed to get recommendations');
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setFetchingRecommendations(false);
        }
    };

    const handleAdd = async () => {
        setLoading(true);

        const payload = {
            ...formData,
            start_date: startDate?.toISOString(),
            end_date: endDate?.toISOString(),
        };

        try {
            const response = await Fetch.POST('/campaign', payload);
            if (response.success) {
                toast.success(response.message);
                router.push('/campaigns');
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full py-4 border-b border-gray flex flex-wrap justify-between items-center gap-3 px-6'>
                <div className='flex items-center gap-3'>
                    <Campaign className='w-8 h-8 fill-dark' />
                    <span className='text-lg font-semibold'>Create New Campaign</span>
                </div>
                <Button variant='outline' className='ml-auto' onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>

            <div className='h-[calc(100vh-10rem)] overflow-y-auto'>
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
                            <label className='col-span-2 font-medium' htmlFor='brand'>
                                Brand
                            </label>
                            <div className='col-span-3'>
                                <SingleSelect
                                    id='brand'
                                    options={brand}
                                    value={formData.brand_id?.toString() ?? null}
                                    onChange={(value) => {
                                        const numValue = typeof value === 'string' ? parseInt(value) : value;
                                        if (!isNaN(numValue as number)) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                brand_id: numValue as number,
                                            }));
                                        }
                                    }}
                                    width='w-full'
                                    allowClear={false}
                                />
                            </div>
                        </div>
                        <div className='grid grid-cols-5 items-center gap-4'>
                            <label className='col-span-2 font-medium' htmlFor='kol_type'>
                                Kol Type
                            </label>
                            <div className='col-span-3'>
                                <SingleSelect
                                    id='kol_type'
                                    options={kolTypes}
                                    value={formData.kol_type_id?.toString() ?? null}
                                    onChange={(value) => {
                                        const numValue = typeof value === 'string' ? parseInt(value) : value;
                                        if (!isNaN(numValue as number)) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                kol_type_id: numValue as number,
                                            }));
                                        }
                                    }}
                                    width='w-full'
                                    allowClear={false}
                                />
                            </div>
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
                            <label className='col-span-2 font-medium' htmlFor='budget'>
                                Budget per KOL
                            </label>
                            <NumericFormat
                                id='budget'
                                name='budget'
                                className='col-span-3 input-style'
                                value={formData.budget ?? ''}
                                thousandSeparator='.'
                                decimalSeparator=','
                                prefix='Rp '
                                allowNegative={false}
                                allowLeadingZeros={false}
                                onValueChange={handleNumberValueChange('budget')}
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
                            <div className='col-span-3 relative'>
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
                            <label className='col-span-2 font-medium' htmlFor='start-date'>
                                Start Date
                            </label>
                            <div className='col-span-3 w-full'>
                                <CustomDatePicker
                                    selectedDate={startDate}
                                    onChange={(date) => {
                                        setStartDate(date ?? null);
                                    }}
                                    placeholder='Select start date'
                                    id='start-date'
                                />
                            </div>
                        </div>
                        <div className='grid grid-cols-5 items-center gap-4'>
                            <label className='col-span-2 font-medium' htmlFor='end-date'>
                                End Date
                            </label>
                            <div className='col-span-3 w-full'>
                                <CustomDatePicker
                                    selectedDate={endDate}
                                    onChange={(date) => {
                                        setEndDate(date ?? null);
                                    }}
                                    placeholder='Select end date'
                                    id='end-date'
                                />
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={fetchRecommendations}
                        disabled={
                            fetchingRecommendations ||
                            !formData.kol_type_id ||
                            !formData.target_niche ||
                            !formData.budget ||
                            !formData.target_engagement ||
                            !formData.target_age_range ||
                            !formData.target_reach ||
                            !formData.target_gender ||
                            !formData.target_gender_min
                        }
                    >
                        {fetchingRecommendations ? 'Fetching...' : 'Get KOL Recommendation'}
                    </Button>

                    <Recommendation
                        recommendedKols={recommendedKols}
                        selectedKols={formData.kol_ids || []}
                        onChange={handleSelectKol}
                        loading={fetchingRecommendations}
                    />

                    <div className='mt-6 flex justify-end gap-2'>
                        <Button variant='outline' onClick={() => router.back()}>
                            Cancel
                        </Button>
                        {formData.kol_ids && formData.kol_ids.length > 0 && (
                            <Button onClick={handleAdd} disabled={loading}>
                                {loading ? 'Creating...' : 'Create'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
