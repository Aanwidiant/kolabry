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
                200
            );
        }

        return c.json(
            {
                success: true,
                data: safeJson(data),
                pagination: Pagination({
                    page: currentPage,
                    limit: take,
                    total,
                }),
            },
            200
        );
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

export const getRecommendedKOLs = async (c: Context) => {
    const body = await c.req.json();

    // Validasi manual minimal
    if (
        !body.kol_type_id ||
        !body.target_niche ||
        !body.target_gender ||
        !body.target_age_range
    ) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    const {
        kol_type_id,
        target_ratecare,
        target_niche,
        target_engagement,
        target_reach,
        target_gender,
        target_gender_min,
        target_age_range,
    } = body;

    // Ambil semua KOL yang sesuai filter awal (PENDEKATAN 1)
    const baseFilter = {
        kol_type_id,
        niche: target_niche,
        audience_age_range: target_age_range,
    };

    const genderFilter =
        target_gender === 'FEMALE'
            ? { audience_female: { gte: target_gender_min } }
            : { audience_male: { gte: target_gender_min } };

    const kols = await prisma.kols.findMany({
        where: {
            ...baseFilter,
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
        },
    });

    // Nilai minimal untuk profile matching
    const minValues = {
        er: target_engagement,
        reach: target_reach,
        audience_gender: target_gender_min,
        ratecard: target_ratecare,
    };

    // Fungsi konversi GAP → skor
    const getERScore = (gap: number) => {
        if (gap <= -8.1) return -5;
        if (gap <= -6.1) return -4;
        if (gap <= -4.1) return -3;
        if (gap <= -2.1) return -2;
        if (gap <= -0.1) return -1;
        if (gap === 0) return 0;
        if (gap <= 2) return 1;
        if (gap <= 4) return 2;
        if (gap <= 6) return 3;
        if (gap <= 8) return 4;
        return 5;
    };

    const getReachScore = (gap: number) => {
        if (gap <= -800) return -5;
        if (gap <= -600) return -4;
        if (gap <= -400) return -3;
        if (gap <= -200) return -2;
        if (gap <= -1) return -1;
        if (gap === 0) return 0;
        if (gap <= 199) return 1;
        if (gap <= 399) return 2;
        if (gap <= 599) return 3;
        if (gap <= 799) return 4;
        return 5;
    };

    const getAudienceScore = (gap: number) => {
        if (gap <= -80) return -5;
        if (gap <= -60) return -4;
        if (gap <= -40) return -3;
        if (gap <= -20) return -2;
        if (gap <= -1) return -1;
        if (gap === 0) return 0;
        if (gap <= 19) return 1;
        if (gap <= 39) return 2;
        if (gap <= 59) return 3;
        if (gap <= 79) return 4;
        return 5;
    };

    const getRatecardScore = (gap: bigint) => {
        if (gap > 4000000) return -5;
        if (gap > 3000000) return -4;
        if (gap > 2000000) return -3;
        if (gap > 1000000) return -2;
        if (gap > 200000) return -1;
        if (gap > 100000) return 0;
        if (gap <= 100000) return 1;
        return 0;
    };

    const weighted = {
        er: 0.2,
        reach: 0.4,
        audience: 0.25,
        ratecard: 0.15,
    };

    const results = kols.map((kol) => {
        const audience = target_gender === 'FEMALE' ? kol.audience_female : kol.audience_male;

        const gapER = kol.engagement_rate - minValues.er;
        const gapReach = kol.reach - minValues.reach;
        const gapAudience = audience - minValues.audience_gender;
        const gapRatecard = minValues.ratecard - kol.rate_card;

        const scoreER = getERScore(gapER);
        const scoreReach = getReachScore(gapReach);
        const scoreAudience = getAudienceScore(gapAudience);
        const scoreRatecard = getRatecardScore(gapRatecard);

        const totalScore =
            scoreER * weighted.er +
            scoreReach * weighted.reach +
            scoreAudience * weighted.audience +
            scoreRatecard * weighted.ratecard;

        return {
            ...kol,
            score: totalScore,
        };
    });

    const sorted = results.sort((a, b) => b.score - a.score);

    return c.json({ result: sorted });
};

