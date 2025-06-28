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

const maxValues = {
    er: parseFloat(process.env.MAX_ER ?? '10'),
    reach: parseFloat(process.env.MAX_REACH ?? '100000'),
    audience: parseFloat(process.env.MAX_AUDIENCE ?? '100'),
    rateCard: parseFloat(process.env.MAX_RATE_CARD ?? '10000000'),
};

const scoreTable = [
    { min: -Infinity, max: -0.5, score: -5 },
    { min: -0.4999999, max: -0.3, score: -4 },
    { min: -0.2999999, max: -0.1, score: -3 },
    { min: -0.0999999, max: -0.05, score: -2 },
    { min: -0.0499999, max: -0.0000001, score: -1 },
    { min: 0, max: 0, score: 1 },
    { min: 0.0000001, max: 0.0499999, score: 1 },
    { min: 0.05, max: 0.0999999, score: 2 },
    { min: 0.1, max: 0.2999999, score: 3 },
    { min: 0.3, max: 0.4999999, score: 4 },
    { min: 0.5, max: Infinity, score: 5 },
];

const factorWeights = {
    core: 0.6,
    secondary: 0.4,
};

export const getRecommendedKOLs = async (c: Context) => {
    try {
        const body = await c.req.json();

        const {
            kol_type_id,
            budget,
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
            typeof budget !== 'number' ||
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

        const kols = await prisma.kols.findMany({
            where: {
                followers: {
                    gte: kolType.min_followers,
                    ...(kolType.max_followers ? { lte: kolType.max_followers } : {}),
                },
                niche: target_niche,
                audience_age_range: target_age_range,
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

        function normalize(value: number, max: number, inverse = false): number {
            const ratio = Math.min(value / max, 1);
            return inverse ? 1 - ratio : ratio;
        }

        function roundTo(value: number, decimals: number): number {
            const factor = 10 ** decimals;
            return Math.round(value * factor) / factor;
        }

        const targetNormalization = {
            er: roundTo(normalize(target_engagement, maxValues.er), 3),
            reach: roundTo(normalize(target_reach, maxValues.reach), 5),
            audience: roundTo(normalize(target_gender_min, maxValues.audience), 2),
            rateCard: roundTo(normalize(budget, maxValues.rateCard, true), 7),
        };

        const results = kols.map((kol) => {
            const normalizedValues = {
                er: roundTo(normalize(kol.engagement_rate, maxValues.er), 3),
                reach: roundTo(normalize(kol.reach, maxValues.reach), 5),
                audience: roundTo(
                    normalize(target_gender === 'FEMALE' ? kol.audience_female : kol.audience_male, maxValues.audience),
                    2
                ),
                rateCard: roundTo(normalize(Number(kol.rate_card), maxValues.rateCard, true), 7),
            };

            const gaps = {
                er: roundTo(normalizedValues.er - targetNormalization.er, 3),
                reach: roundTo(normalizedValues.reach - targetNormalization.reach, 5),
                audience: roundTo(normalizedValues.audience - targetNormalization.audience, 2),
                rateCard: roundTo(normalizedValues.rateCard - targetNormalization.rateCard, 7),
            };

            function getScoreFromGap(gap: number): number {
                const match = scoreTable.find((rule) => gap > rule.min && gap <= rule.max);
                return match ? match.score : 0;
            }

            const scores = {
                er: getScoreFromGap(gaps.er),
                reach: getScoreFromGap(gaps.reach),
                audience: getScoreFromGap(gaps.audience),
                rateCard: getScoreFromGap(gaps.rateCard),
            };

            const coreFactor = (scores.rateCard + scores.reach) / 2;
            const secondaryFactor = (scores.er + scores.audience) / 2;

            const totalScore = factorWeights.core * coreFactor + factorWeights.secondary * secondaryFactor;

            return {
                ...kol,
                score: parseFloat(totalScore.toFixed(2)),
                details: {
                    normalizedValues,
                    gaps,
                    scores,
                    coreFactor,
                    secondaryFactor,
                },
            };
        });

        const top10 = results.sort((a, b) => b.score - a.score).slice(0, 10);

        return c.json({
            success: true,
            data: safeJson(top10),
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return c.json(
            {
                success: false,
                message: 'An error occurred on the server.',
                error: errorMessage,
            },
            500
        );
    }
};
