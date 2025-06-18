import type { KolType } from '@/types';

const MAX_BIGINT = BigInt('9223372036854775807');
const MIN_BIGINT = BigInt('0');

export function validateKolType(data: Partial<KolType>, existingMinFollowers?: bigint) {
    if (!data.name) {
        return { valid: false, message: 'Name is required' };
    }

    if ('name' in data && typeof data.name !== 'string') {
        return { valid: false, message: 'Name must be a string.' };
    }

    let min: bigint | undefined;

    if (data.min_followers !== undefined && data.min_followers !== null) {
        try {
            min = BigInt(data.min_followers);
        } catch {
            return { valid: false, message: 'Min followers must be a valid integer.' };
        }

        if (min < MIN_BIGINT || min > MAX_BIGINT) {
            return { valid: false, message: 'Min followers is out of allowed range.' };
        }
    } else if (existingMinFollowers !== undefined) {
        min = existingMinFollowers;
    } else {
        return { valid: false, message: 'Min followers is required.' };
    }

    if (data.max_followers !== undefined && data.max_followers !== null) {
        let max: bigint;

        try {
            max = BigInt(data.max_followers);
        } catch {
            return { valid: false, message: 'Max followers must be a valid integer.' };
        }

        if (max < MIN_BIGINT || max > MAX_BIGINT) {
            return { valid: false, message: 'Max followers is out of allowed range.' };
        }

        if (max <= min) {
            return { valid: false, message: 'Max followers must be greater than min followers.' };
        }
    }

    return { valid: true };
}
