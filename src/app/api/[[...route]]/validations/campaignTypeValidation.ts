import type { CampaignType } from '@/types';

export function validateCampaignType(data: Partial<CampaignType>, existingMinFollowers?: number) {
    if (typeof data.id !== 'number') {
        return { valid: false, message: 'id must be a number.' };
    }

    if (typeof data.name !== 'string') {
        return { valid: false, message: 'name must be a string.' };
    }

    if (typeof data.min_followers !== 'number') {
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
