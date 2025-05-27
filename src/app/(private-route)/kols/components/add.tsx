import React, { useState } from 'react';
import SingleSelect from '@/components/globals/single-select';
import Fetch from '@/utilities/fetch';
import { Add } from '@/components/icons';
import { toast } from 'react-toastify';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import CustomNumberInput from '@/components/globals/custom-number-input';
import { Kols } from '@/types';
import { ageRangeOptions, nicheTypeOptions } from '@/constants/option';

interface AddKolProps {
    onClose: () => void;
    onAdd: () => void;
}

export function AddKol({ onClose, onAdd }: AddKolProps) {
    const [formData, setFormData] = useState<Partial<Kols>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: keyof Kols, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value ?? undefined }));
    };

    const handleAdd = async () => {
        const requiredFields: (keyof Kols)[] = [
            'name',
            'niche',
            'followers',
            'engagement_rate',
            'reach',
            'rate_card',
            'audience_male',
            'audience_female',
            'audience_age_range',
        ];

        const missing = requiredFields.find((field) => formData[field] === undefined || formData[field] === '');

        if (missing) {
            toast.error(`Field '${missing}' is required.`);
            return;
        }

        setLoading(true);
        try {
            await Fetch.POST('/kol', [formData]);
            onAdd();
            onClose();
            toast.success('KOL created successfully.');
        } catch {
            toast.error('Failed to create KOL.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            icon={<Add className='w-8 h-8 fill-dark' />}
            title='Add New Key Opinion Leader'
            footer={
                <Button onClick={handleAdd} disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                </Button>
            }
        >
            <div className='grid gap-4'>
                <FormRow label='Name'>
                    <input
                        className='input-style no-arrow col-span-3'
                        id='name'
                        name='name'
                        type='text'
                        value={formData.name ?? ''}
                        onChange={handleChange}
                    />
                </FormRow>

                <FormRow label='Niche'>
                    <div className='col-span-3'>
                        <SingleSelect
                            id='niche'
                            options={nicheTypeOptions}
                            value={formData.niche ?? null}
                            onChange={(val) => handleSelectChange('niche', val)}
                            width='w-full'
                        />
                    </div>
                </FormRow>

                <FormRow label='Audience Age Range'>
                    <div className='col-span-3'>
                        <SingleSelect
                            id='audience_age_range'
                            options={ageRangeOptions}
                            value={formData.audience_age_range ?? null}
                            onChange={(val) => handleSelectChange('audience_age_range', val)}
                            width='w-full'
                        />
                    </div>
                </FormRow>

                <FormRow label='Audience Male (%)'>
                    <CustomNumberInput
                        className='col-span-3'
                        name='audience_male'
                        suffix='%'
                        decimalScale={2}
                        value={formData.audience_male ?? ''}
                        onValueChange={(values) =>
                            setFormData((prev) => ({ ...prev, audience_male: values.floatValue }))
                        }
                    />
                </FormRow>

                <FormRow label='Audience Female (%)'>
                    <CustomNumberInput
                        className='col-span-3'
                        name='audience_female'
                        suffix='%'
                        decimalScale={2}
                        value={formData.audience_female ?? ''}
                        onValueChange={(values) =>
                            setFormData((prev) => ({ ...prev, audience_female: values.floatValue }))
                        }
                    />
                </FormRow>

                <FormRow label='Followers'>
                    <CustomNumberInput
                        className='col-span-3'
                        name='followers'
                        value={formData.followers ?? ''}
                        onValueChange={(values) => setFormData((prev) => ({ ...prev, followers: values.floatValue }))}
                    />
                </FormRow>

                <FormRow label='Engagement Rate'>
                    <input
                        className='input-style no-arrow col-span-3'
                        name='engagement_rate'
                        type='number'
                        step='0.01'
                        value={formData.engagement_rate ?? ''}
                        onChange={handleChange}
                    />
                </FormRow>

                <FormRow label='Reach'>
                    <CustomNumberInput
                        className='col-span-3'
                        name='reach'
                        value={formData.reach ?? ''}
                        onValueChange={(values) => setFormData((prev) => ({ ...prev, reach: values.floatValue }))}
                    />
                </FormRow>

                <FormRow label='Rate Card'>
                    <CustomNumberInput
                        className='col-span-3'
                        name='rate_card'
                        value={formData.rate_card ?? ''}
                        onValueChange={(values) => setFormData((prev) => ({ ...prev, rate_card: values.floatValue }))}
                    />
                </FormRow>
            </div>
        </Modal>
    );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className='grid grid-cols-5 items-center gap-4'>
            <label className='col-span-2 font-medium'>{label}</label>
            {children}
        </div>
    );
}
