import type { KolType } from '@/types';

export function validateKolType(data: Partial<KolType>, existingMinFollowers?: number) {
    if (!data.name) {
        return { valid: false, message: 'Name is required' };
    }

    if (data.min_followers === undefined || data.min_followers === null) {
        return { valid: false, message: 'Min followers is required' };
    }

    if ('name' in data && typeof data.name !== 'string') {
        return { valid: false, message: 'name must be a string.' };
    }

    if ('min_followers' in data && typeof data.min_followers !== 'number') {
        return { valid: false, message: 'min followers must be a number.' };
    }

    if (data.max_followers !== null && typeof data.max_followers !== 'number') {
        return {
            valid: false,
            message: 'max followers must be a number or null.',
        };
    }

    const min = 'min_followers' in data ? data.min_followers : existingMinFollowers;

    if (data.max_followers !== null && typeof min === 'number' && data.max_followers <= min) {
        return {
            valid: false,
            message: 'max followers must be greater than min followers.',
        };
    }

    return { valid: true };
}
