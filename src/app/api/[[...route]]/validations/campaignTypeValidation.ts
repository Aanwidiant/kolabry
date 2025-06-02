import type { CampaignTypes } from '@/types';

export function validateCampaignType(data: Partial<CampaignTypes>, existingMinFollowers?: number) {
    if ('id' in data && typeof data.id !== 'number') {
        return { valid: false, message: 'id must be a number.' };
    }

    if ('name' in data && typeof data.name !== 'string') {
        return { valid: false, message: 'name must be a string.' };
    }

    if ('min_followers' in data && typeof data.min_followers !== 'number') {
        return { valid: false, message: 'min_followers must be a number.' };
    }

    if (data.max_followers !== null && typeof data.max_followers !== 'number') {
        return {
            valid: false,
            message: 'max_followers must be a number or null.',
        };
    }

    const min = 'min_followers' in data ? data.min_followers : existingMinFollowers;

    if (data.max_followers !== null && typeof min === 'number' && data.max_followers <= min) {
        return {
            valid: false,
            message: 'max_followers must be greater than min_followers.',
        };
    }

    return { valid: true };
}
