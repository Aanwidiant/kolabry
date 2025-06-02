import type { KolReport } from '@/types';

export function validateKolReport(data: Partial<KolReport>) {
    const numberFields: (keyof KolReport)[] = [
        'id',
        'campaign_id',
        'kol_id',
        'like_count',
        'comment_count',
        'share_count',
        'save_count',
        'engagement',
        'reach',
        'er',
        'cpe',
        'final_score',
        'ranking',
    ];

    for (const field of numberFields) {
        if (data[field] !== undefined && typeof data[field] !== 'number') {
            return { valid: false, message: `${field} must be a number.` };
        }
    }

    return { valid: true };
}
