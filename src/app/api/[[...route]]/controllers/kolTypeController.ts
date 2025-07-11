import type { Context } from 'hono';
import { prisma } from '@/lib/prisma';
import { validateKolType } from '../validations/kolTypeValidation';
import { Prisma } from '@prisma/client';
import { Pagination, safeJson } from '../helpers';

export const createKolType = async (c: Context) => {
    const body = await c.req.json();

    const existingName = await prisma.kol_types.findFirst({
        where: { name: body.name },
    });

    if (existingName) {
        return c.json(
            {
                success: false,
                message: 'KOL Type name already used.',
            },
            400
        );
    }

    const validation = validateKolType(body);
    if (!validation.valid) {
        return c.json(
            {
                success: false,
                message: validation.message,
            },
            400
        );
    }

    try {
        const { name, min_followers, max_followers } = body;
        await prisma.kol_types.create({
            data: {
                name,
                min_followers,
                max_followers: max_followers ?? null,
            },
        });

        return c.json(
            {
                success: true,
                message: 'KOL Type successfully created.',
            },
            201
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'An error occurred while creating KOL Type.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const getKolTypes = async (c: Context) => {
    const { search = '', page = '1', limit = '10', noPagination = 'false' } = c.req.query();

    const noPaginationFlag = noPagination === 'true';
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    const whereClause = search
        ? {
              name: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
              },
          }
        : {};

    try {
        const kolTypes = await prisma.kol_types.findMany({
            where: whereClause,
            orderBy: { id: 'asc' },
            ...(noPaginationFlag ? {} : { skip: offset, take: limitNumber }),
        });

        const total = await prisma.kol_types.count({ where: whereClause });

        if (kolTypes.length === 0) {
            return c.json(
                {
                    success: true,
                    message: 'No KOL Types found.',
                },
                200
            );
        }

        return c.json({
            success: true,
            data: safeJson(kolTypes),
            ...(noPaginationFlag
                ? {}
                : {
                      pagination: Pagination({
                          page: pageNumber,
                          limit: limitNumber,
                          total: total,
                      }),
                  }),
        });
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to fetch KOL Types.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const updateKolType = async (c: Context) => {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const { name, min_followers, max_followers } = body;

    if (!id) {
        return c.json(
            {
                success: false,
                message: 'KOL Type ID is required.',
            },
            400
        );
    }

    const existingKolType = await prisma.kol_types.findUnique({
        where: { id },
    });

    if (!existingKolType) {
        return c.json({ success: false, message: 'KOL Type not found' }, 404);
    }

    const isSameName = name === undefined || name === existingKolType.name;
    const isSameMin = min_followers === undefined || min_followers === existingKolType.min_followers;
    const isSameMax = max_followers === undefined || max_followers === existingKolType.max_followers;

    if (isSameName && isSameMin && isSameMax) {
        return c.json(
            {
                success: false,
                error: 'no_change',
                message: 'No data was changed.',
            },
            400
        );
    }

    if (name && name !== existingKolType.name) {
        const nameConflict = await prisma.kol_types.findFirst({
            where: {
                name,
                NOT: { id },
            },
        });

        if (nameConflict) {
            return c.json(
                {
                    success: false,
                    message: 'Name is already used by another KOL type.',
                },
                400
            );
        }
    }

    const validation = validateKolType(body, existingKolType.min_followers);
    if (!validation.valid) {
        return c.json(
            {
                success: false,
                message: validation.message,
            },
            400
        );
    }

    try {
        await prisma.kol_types.update({
            where: { id },
            data: {
                ...(name !== undefined && name !== existingKolType.name && { name }),
                ...(min_followers !== undefined &&
                    min_followers !== existingKolType.min_followers && { min_followers }),
                ...(max_followers !== undefined &&
                    max_followers !== existingKolType.max_followers && { max_followers }),
            },
        });

        return c.json({
            success: true,
            message: 'KOL Type updated successfully.',
        });
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to update KOL Type.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const deleteKolType = async (c: Context) => {
    const id = parseInt(c.req.param('id'));

    if (!id) {
        return c.json(
            {
                success: false,
                message: 'KOL Type ID is required.',
            },
            400
        );
    }

    try {
        const existing = await prisma.kol_types.findUnique({ where: { id } });

        if (!existing) {
            return c.json(
                {
                    success: false,
                    message: 'KOL Type not found.',
                },
                404
            );
        }

        await prisma.kol_types.delete({ where: { id } });
        return c.json(
            {
                success: true,
                message: 'KOL Type successfully deleted.',
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to delete KOL Type.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};
