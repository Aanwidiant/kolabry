import type { Campaigns, GenderType, NicheType, AgeRangeType } from '@/types';

export function validateCampaign(data: Partial<Campaigns> & { kol_ids?: number[] }) {
    if (!Array.isArray(data.kol_ids) || data.kol_ids.length === 0) {
        return { valid: false, message: 'kol_ids must be a non-empty array.' };
    }

    const GenderTypes: GenderType[] = ['MALE', 'FEMALE'];

    const NicheTypes: NicheType[] = [
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

    const AgeRangeTypes: AgeRangeType[] = [
        'AGE_13_17',
        'AGE_18_24',
        'AGE_25_34',
        'AGE_35_44',
        'AGE_45_54',
        'AGE_55_PLUS',
    ];

    if (!NicheTypes.includes(data.target_niche!)) {
        return {
            valid: false,
            message: `target_niche must be one of: ${NicheTypes.join(', ')}`,
        };
    }

    if (!GenderTypes.includes(data.target_gender!)) {
        return {
            valid: false,
            message: `target_gender must be one of: ${GenderTypes.join(', ')}`,
        };
    }

    if (!AgeRangeTypes.includes(data.target_age_range!)) {
        return {
            valid: false,
            message: `target_age_range must be one of: ${AgeRangeTypes.join(', ')}`,
        };
    }

    if ('budget' in data && typeof data.budget !== 'number') {
        return { valid: false, message: 'budget must be a number.' };
    }

    if ('target_engagement' in data && typeof data.target_engagement !== 'number') {
        return { valid: false, message: 'target_engagement must be a number.' };
    }

    if ('target_reach' in data && typeof data.target_reach !== 'number') {
        return { valid: false, message: 'target_reach must be a number.' };
    }

    if ('target_gender_min' in data && typeof data.target_gender_min !== 'number') {
        return { valid: false, message: 'target_gender_min must be a number.' };
    }

    if (!(data.start_date instanceof Date) || isNaN(data.start_date.getTime())) {
        return {
            valid: false,
            message: 'start_date must be a valid Date object.',
        };
    }

    if (!(data.end_date instanceof Date) || isNaN(data.end_date.getTime())) {
        return {
            valid: false,
            message: 'end_date must be a valid Date object.',
        };
    }

    if (data.end_date <= data.start_date) {
        return {
            valid: false,
            message: 'end_date must be later than start_date.',
        };
    }

    const diff = data.end_date.getTime() - data.start_date.getTime();
    if (diff < 24 * 60 * 60 * 1000) {
        return {
            valid: false,
            message: 'end_date must be at least 1 day after start_date.',
        };
    }

    return { valid: true };
}
