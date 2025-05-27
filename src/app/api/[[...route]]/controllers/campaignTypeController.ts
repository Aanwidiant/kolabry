import type { Context } from 'hono';
import { prisma } from '@/lib/prisma';
import { validateCampaignType } from '../validations/campaignTypeValidation';
import { Prisma } from '@prisma/client';
import { Pagination } from '../helpers/pagination';

export const createCampaignType = async (c: Context) => {
    const body = await c.req.json();

    if (!body.name || !body.min_followers) {
        return c.json(
            {
                success: false,
                message: 'name, min_followers is required',
            },
            400
        );
    }

    const existingName = await prisma.campaign_types.findFirst({
        where: { name: body.name },
    });

    if (existingName) {
        return c.json(
            {
                success: false,
                message: 'name Campaign Type already used.',
            },
            400
        );
    }

    const validation = validateCampaignType(body);
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
        const newCampaignType = await prisma.campaign_types.create({
            data: {
                name,
                min_followers,
                max_followers: max_followers ?? null,
            },
        });

        return c.json(
            {
                success: true,
                message: 'Campaign type successfully created.',
                data: newCampaignType,
            },
            201
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'An error occurred while creating Campaign Type.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const getCampaignTypes = async (c: Context) => {
    const { search = '', page = '1', limit = '10' } = c.req.query();

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
        const campaignTypes = await prisma.campaign_types.findMany({
            where: whereClause,
            skip: offset,
            take: limitNumber,
        });

        const total = await prisma.campaign_types.count({ where: whereClause });

        if (campaignTypes.length === 0) {
            return c.json(
                {
                    success: true,
                    message: 'No Campaign Types found.',
                },
                200
            );
        }

        return c.json({
            success: true,
            data: campaignTypes,
            pagination: Pagination({
                page: pageNumber,
                limit: limitNumber,
                total: total,
            }),
        });
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to fetch Campaign Types.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const updateCampaignType = async (c: Context) => {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const { name, min_followers, max_followers } = body;

    if (!name && min_followers === undefined && max_followers === undefined) {
        return c.json(
            {
                success: false,
                message: 'No fields to update were provided.',
            },
            400
        );
    }
    const existingCampaignType = await prisma.campaign_types.findUnique({
        where: { id },
    });

    if (!existingCampaignType) {
        return c.json({ success: false, message: 'Campaign Type not found' }, 404);
    }

    if (name) {
        const nameConflict = await prisma.campaign_types.findFirst({
            where: {
                name,
                NOT: { id },
            },
        });

        if (nameConflict) {
            return c.json(
                {
                    success: false,
                    message: 'Name is already used by another Campaign type.',
                },
                400
            );
        }
    }

    const validation = validateCampaignType(body, existingCampaignType.min_followers);
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
        const updatedCampaignType = await prisma.campaign_types.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(min_followers !== undefined && { min_followers }),
                ...(max_followers !== undefined && { max_followers }),
            },
        });

        return c.json({
            success: true,
            message: 'Campaign type updated successfully.',
            data: updatedCampaignType,
        });
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to update Campaign type.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const deleteCampaignType = async (c: Context) => {
    const id = parseInt(c.req.param('id'));

    if (!id) {
        return c.json(
            {
                success: false,
                message: 'Campaign Type ID is required.',
            },
            400
        );
    }

    try {
        const existing = await prisma.campaign_types.findUnique({ where: { id } });

        if (!existing) {
            return c.json(
                {
                    success: false,
                    message: 'Campaign Type not found.',
                },
                404
            );
        }

        await prisma.campaign_types.delete({ where: { id } });
        return c.json(
            {
                success: true,
                message: 'Campaign Type successfully deleted.',
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to delete Campaign Type.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};
