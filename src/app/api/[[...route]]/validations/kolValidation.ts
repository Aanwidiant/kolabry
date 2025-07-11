import type { Kols, NicheType, AgeRangeType } from '@/types';

export function validateKol(data: Partial<Kols>) {
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

    if ('id' in data && typeof data.id !== 'number') return { valid: false, message: 'id must be a number.' };

    if ('name' in data && typeof data.name !== 'string') return { valid: false, message: 'name must be a string.' };

    if (!NicheTypes.includes(data.niche!))
        return {
            valid: false,
            message: `niche must be one of: ${NicheTypes.join(', ')}`,
        };

    if ('followers' in data && typeof data.followers !== 'number')
        return { valid: false, message: 'followers must be a number.' };

    if ('engagement_rate' in data && typeof data.engagement_rate !== 'number')
        return { valid: false, message: 'engagement_rate must be a number.' };

    if ('reach' in data && typeof data.reach !== 'number') return { valid: false, message: 'reach must be a number.' };

    if ('rate_card' in data && typeof data.rate_card !== 'number')
        return { valid: false, message: 'rate_card must be a number.' };

    if ('audience_male' in data && typeof data.audience_male !== 'number')
        return { valid: false, message: 'audience_male must be a number.' };

    if ('audience_female' in data && typeof data.audience_female !== 'number')
        return { valid: false, message: 'audience_female must be a number.' };

    if (
        'audience_male' in data &&
        'audience_female' in data &&
        typeof data.audience_male === 'number' &&
        typeof data.audience_female === 'number'
    ) {
        const total = data.audience_male + data.audience_female;
        if (total !== 100) {
            return {
                valid: false,
                message: 'Total of audience male and audience female must be exactly 100%',
            };
        }
    }

    if (!AgeRangeTypes.includes(data.audience_age_range!))
        return {
            valid: false,
            message: `audience_age_range must be one of: ${AgeRangeTypes.join(', ')}`,
        };

    return { valid: true };
}
