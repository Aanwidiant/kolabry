import { Context } from 'hono';
import { prisma } from '@/lib/prisma';
import { validateKol } from '../validations/kolValidation';
import { Kols } from '@/types';
import { Prisma, NicheType, AgeRangeType } from '@prisma/client';
import { Pagination, safeJson } from '../helpers';

// Create KOL data
export const createKol = async (c: Context) => {
    try {
        const body = await c.req.json();
        const isArrayInput = Array.isArray(body);
        const dataArray = isArrayInput ? body : [body];

        const requiredFields = [
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

        for (const item of dataArray) {
            const missingField = requiredFields.find((field) => item[field] === undefined || item[field] === null);

            if (missingField) {
                return c.json(
                    {
                        success: false,
                        message: `Field ${missingField} is required`,
                    },
                    400
                );
            }

            const validation = validateKol(item);
            if (!validation.valid) {
                return c.json(
                    {
                        success: false,
                        message: `${validation.message}`,
                    },
                    400
                );
            }
        }

        if (isArrayInput && dataArray.length > 1) {
            await prisma.kols.createMany({ data: dataArray });

            return c.json(
                {
                    success: true,
                    message: 'All KOL data inserted successfully.',
                },
                201
            );
        } else {
            await prisma.kols.create({ data: dataArray[0] });

            return c.json(
                {
                    success: true,
                    message: 'KOL data created successfully.',
                },
                201
            );
        }
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'An error occurred on the server.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Get KOL data
export const getKols = async (c: Context) => {
    try {
        const { search = '', page = '1', limit = '10', niche, ageRange } = c.req.query();

        const currentPage = parseInt(page, 10);
        const take = parseInt(limit, 10);
        const skip = (currentPage - 1) * take;

        const isValidNiche = (value: string): value is NicheType =>
            Object.values(NicheType).includes(value as NicheType);

        const isValidAgeRange = (value: string): value is AgeRangeType =>
            Object.values(AgeRangeType).includes(value as AgeRangeType);

        const filters: Prisma.kolsWhereInput = {
            ...(niche && isValidNiche(niche) ? { niche: niche as NicheType } : {}),
            ...(ageRange && isValidAgeRange(ageRange) ? { audience_age_range: ageRange as AgeRangeType } : {}),
            ...(search
                ? {
                      name: {
                          contains: search,
                          mode: 'insensitive',
                      },
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            prisma.kols.findMany({
                where: filters,
                skip,
                take,
                orderBy: { id: 'asc' },
            }),
            prisma.kols.count({ where: filters }),
        ]);

        if (data.length === 0) {
            return c.json(
                {
                    success: true,
                    message: 'No KOL data found.',
                },
                400
            );
        }

        return c.json({
            success: true,
            data: safeJson(data),
            pagination: Pagination({
                page: currentPage,
                limit: take,
                total,
            }),
        });
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'An error occurred while fetching KOLs.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Update KOL data

export const updateKol = async (c: Context) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();

        if (!id) {
            return c.json(
                {
                    success: false,
                    message: 'KOL ID is required.',
                },
                400
            );
        }

        const existingKol = await prisma.kols.findUnique({
            where: { id },
        });

        if (!existingKol) {
            return c.json(
                {
                    success: false,
                    message: 'KOL data not found.',
                },
                404
            );
        }

        const updatedData = { ...existingKol, ...body };
        const validation = validateKol(updatedData);

        if (!validation.valid) {
            return c.json(
                {
                    success: false,
                    message: validation.message,
                },
                400
            );
        }

        const updatableFields = [
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

        const updateFields: Record<string, Kols> = {};
        for (const field of updatableFields) {
            if (field in body) {
                updateFields[field] = body[field];
            }
        }

        const isBigIntField = ['followers', 'rate_card'];

        const isChanged = updatableFields.some((field) => {
            const key = field as keyof typeof existingKol;
            const existingValue = existingKol[key];
            const newValue = body[key];

            if (isBigIntField.includes(field)) {
                return BigInt(newValue) !== existingValue;
            }

            return newValue !== existingValue;
        });

        if (!isChanged) {
            return c.json(
                {
                    success: false,
                    error: 'no_change',
                    message: 'No data was changed',
                },
                400
            );
        }

        await prisma.kols.update({
            where: { id },
            data: updateFields,
        });

        return c.json(
            {
                success: true,
                message: 'KOL updated successfully.',
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'An error occurred on the server.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

// Delete KOL data
export const deleteKol = async (c: Context) => {
    const id = parseInt(c.req.param('id'));

    if (!id) {
        return c.json(
            {
                success: false,
                message: 'KOL ID is required.',
            },
            400
        );
    }

    try {
        await prisma.kols.delete({ where: { id } });
        return c.json(
            {
                success: true,
                message: 'KOL data successfully deleted.',
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to delete KOL data.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

const WEIGHTS = {
    er: 0.2,
    reach: 0.4,
    audience: 0.25,
    ratecard: 0.15,
};

const getScore = (gap: number, thresholds: number[], scores: number[]) => {
    for (let i = 0; i < thresholds.length; i++) {
        if (gap <= thresholds[i]) return scores[i];
    }
    return scores[scores.length - 1];
};

export const getRecommendedKOLs = async (c: Context) => {
    try {
        const body = await c.req.json();

        const {
            kol_type_id,
            target_ratecard,
            target_niche,
            target_engagement,
            target_reach,
            target_gender,
            target_gender_min,
            target_age_range,
        } = body;

        if (
            !kol_type_id ||
            !target_niche ||
            !target_gender ||
            !target_age_range ||
            typeof target_engagement !== 'number' ||
            typeof target_reach !== 'number' ||
            typeof target_ratecard !== 'number' ||
            typeof target_gender_min !== 'number'
        ) {
            return c.json({ error: 'Missing or invalid required fields' }, 400);
        }

        const kolType = await prisma.kol_types.findUnique({
            where: { id: kol_type_id },
        });

        if (!kolType) {
            return c.json({ error: 'Invalid kol_type_id' }, 404);
        }

        const genderFilter =
            target_gender === 'FEMALE'
                ? { audience_female: { gte: target_gender_min } }
                : { audience_male: { gte: target_gender_min } };

        const kols = await prisma.kols.findMany({
            where: {
                followers: {
                    gte: kolType.min_followers,
                    ...(kolType.max_followers ? { lte: kolType.max_followers } : {}),
                },
                niche: target_niche,
                audience_age_range: target_age_range,
                ...genderFilter,
            },
            select: {
                id: true,
                name: true,
                engagement_rate: true,
                reach: true,
                audience_female: true,
                audience_male: true,
                rate_card: true,
                followers: true,
            },
        });

        const results = kols.map((kol) => {
            const audience = target_gender === 'FEMALE' ? kol.audience_female : kol.audience_male;

            const gapER = kol.engagement_rate - target_engagement;
            const gapReach = kol.reach - target_reach;
            const gapAudience = audience - target_gender_min;
            const gapRatecard = target_ratecard - Number(kol.rate_card);

            const scoreER = getScore(
                gapER,
                [-8.1, -6.1, -4.1, -2.1, -0.1, 0, 2, 4, 6, 8],
                [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
            );
            const scoreReach = getScore(
                gapReach,
                [-800, -600, -400, -200, -1, 0, 199, 399, 599, 799],
                [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
            );
            const scoreAudience = getScore(
                gapAudience,
                [-80, -60, -40, -20, -1, 0, 19, 39, 59, 79],
                [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
            );
            const scoreRatecard = getScore(
                gapRatecard,
                [4000000, 3000000, 2000000, 1000000, 200000, 100000],
                [-5, -4, -3, -2, -1, 0, 1]
            );

            const totalScore =
                scoreER * WEIGHTS.er +
                scoreReach * WEIGHTS.reach +
                scoreAudience * WEIGHTS.audience +
                scoreRatecard * WEIGHTS.ratecard;

            return {
                ...kol,
                score: totalScore,
            };
        });

        const sorted = results.sort((a, b) => b.score - a.score).slice(0, 10);

        return c.json({
            success: true,
            data: safeJson(sorted),
        });
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'An error occurred on the server.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};
