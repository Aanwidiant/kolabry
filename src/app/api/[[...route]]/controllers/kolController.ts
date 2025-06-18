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

        for (const [index, item] of dataArray.entries()) {
            const missingField = requiredFields.find((field) => item[field] === undefined || item[field] === null);

            if (missingField) {
                return c.json(
                    {
                        success: false,
                        message: `Item ${index + 1}: Field '${missingField}' is required.`,
                    },
                    400
                );
            }

            const validation = validateKol(item);
            if (!validation.valid) {
                return c.json(
                    {
                        success: false,
                        message: `Item ${index + 1}: ${validation.message}`,
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

        // Buat list field yang boleh diupdate saja
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

        // Ambil field yang mau diupdate
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
