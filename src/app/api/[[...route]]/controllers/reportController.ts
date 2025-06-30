import type { Context } from 'hono';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Pagination, safeJson } from '@/app/api/[[...route]]/helpers';
import { validateKolReport } from '@/app/api/[[...route]]/validations/reportValidation';
import ExcelJS from 'exceljs';
import { KolReportGenerate } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const createReports = async (c: Context) => {
    try {
        const body = await c.req.json();
        const isArrayInput = Array.isArray(body);
        const dataArray = isArrayInput ? body : [body];

        const requiredFields = [
            'campaign_id',
            'kol_id',
            'like_count',
            'comment_count',
            'share_count',
            'save_count',
            'reach',
            'cost',
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

            const campaignExists = await prisma.campaigns.findUnique({
                where: { id: item.campaign_id },
                select: { id: true },
            });

            if (!campaignExists) {
                return c.json(
                    {
                        success: false,
                        error: 'campaing_not_found',
                        message: `Campaign with id ${item.campaign_id} not found.`,
                    },
                    404
                );
            }

            const kolLinked = await prisma.campaign_kol.findUnique({
                where: {
                    campaign_id_kol_id: {
                        campaign_id: item.campaign_id,
                        kol_id: item.kol_id,
                    },
                },
                select: { id: true },
            });

            if (!kolLinked) {
                return c.json(
                    {
                        success: false,
                        error: 'KOL not linked',
                        message: `KOL ${item.kol_id} is not linked to Campaign ${item.campaign_id}`,
                    },
                    400
                );
            }

            const existingReport = await prisma.kol_reports.findUnique({
                where: {
                    campaign_id_kol_id: {
                        campaign_id: item.campaign_id,
                        kol_id: item.kol_id,
                    },
                },
                include: {
                    kol: {
                        select: {
                            name: true,
                        },
                    },
                    campaign: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

            if (existingReport) {
                const kolName = existingReport.kol.name;
                const campaignName = existingReport.campaign.name;

                return c.json(
                    {
                        success: false,
                        message: `Report for ${kolName} in campaign '${campaignName}' already exists.`,
                    },
                    409
                );
            }

            const validation = validateKolReport(item);
            if (!validation.valid) {
                return c.json(
                    {
                        success: false,
                        message: `${validation.message}`,
                    },
                    400
                );
            }

            const engagement =
                Number(item.like_count) +
                Number(item.comment_count) +
                Number(item.share_count) +
                Number(item.save_count);

            const erRaw = item.reach > 0 ? (engagement / Number(item.reach)) * 100 : 0;
            const er = Number(erRaw.toFixed(2));

            const cpeRaw = engagement > 0 ? Number(item.cost) / engagement : 0;
            const cpe = Math.round(cpeRaw);

            item.engagement = engagement;
            item.er = er;
            item.cpe = cpe;
        }

        if (isArrayInput && dataArray.length > 1) {
            await prisma.kol_reports.createMany({ data: dataArray });

            await calculateWPScores(dataArray[0].campaign_id);

            return c.json(
                {
                    success: true,
                    message: 'All KOL report inserted successfully.',
                },
                201
            );
        } else {
            await prisma.kol_reports.create({ data: dataArray[0] });

            await calculateWPScores(dataArray[0].campaign_id);

            return c.json(
                {
                    success: true,
                    message: 'KOL Report created successfully.',
                },
                201
            );
        }
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to create reports.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const updateReport = async (c: Context) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();

        const { like_count, comment_count, share_count, save_count, reach, cost } = body;

        const requiredFields = ['like_count', 'comment_count', 'share_count', 'save_count', 'reach', 'cost'];

        const missingField = requiredFields.find((field) => body[field] === undefined || body[field] === null);

        if (missingField) {
            return c.json(
                {
                    success: false,
                    message: `Field ${missingField} is required.`,
                },
                400
            );
        }

        const existingReport = await prisma.kol_reports.findUnique({
            where: { id },
        });

        if (!existingReport) {
            return c.json(
                {
                    success: false,
                    message: `Report with ID ${id} not found.`,
                },
                404
            );
        }

        const isSame =
            Number(existingReport.like_count) === Number(like_count) &&
            Number(existingReport.comment_count) === Number(comment_count) &&
            Number(existingReport.share_count) === Number(share_count) &&
            Number(existingReport.save_count) === Number(save_count) &&
            Number(existingReport.reach) === Number(reach) &&
            Number(existingReport.cost) === Number(cost);

        if (isSame) {
            return c.json(
                {
                    success: false,
                    error: 'no_change',
                    message: 'No data was changed',
                },
                400
            );
        }

        const validation = validateKolReport(body);
        if (!validation.valid) {
            return c.json(
                {
                    success: false,
                    message: validation.message,
                },
                400
            );
        }

        const engagement = Number(like_count) + Number(comment_count) + Number(share_count) + Number(save_count);

        const erRaw = reach > 0 ? (engagement / Number(reach)) * 100 : 0;
        const er = Number(erRaw.toFixed(2));

        const cpeRaw = engagement > 0 ? Number(cost) / engagement : 0;
        const cpe = Math.round(cpeRaw);

        await prisma.kol_reports.update({
            where: { id },
            data: {
                like_count,
                comment_count,
                share_count,
                save_count,
                reach,
                cost,
                engagement,
                er,
                cpe,
            },
        });

        await calculateWPScores(existingReport.campaign_id);

        return c.json(
            {
                success: true,
                message: 'KOL Report updated successfully.',
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to update report.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const getReports = async (c: Context) => {
    try {
        const user = c.get('user');
        const page = Number(c.req.query('page') || '1');
        const limit = Number(c.req.query('limit') || '10');
        const offset = (page - 1) * limit;
        const search = c.req.query('search')?.toString() || '';

        const where: Prisma.campaignsWhereInput = {
            ...(search && {
                name: {
                    contains: search,
                    mode: 'insensitive',
                },
            }),

            ...(user.role === 'BRAND' && { user_id: user.id }),
        };

        const total = await prisma.campaigns.count({ where });

        const campaigns = await prisma.campaigns.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
                id: 'desc',
            },
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
                _count: {
                    select: { campaign_kols: true },
                },
            },
        });

        const reportData = campaigns.map((campaign) => ({
            id: campaign.id,
            name: campaign.name,
            brand_name: campaign.user.username,
            target_niche: campaign.target_niche,
            start_date: campaign.start_date,
            end_date: campaign.end_date,
            count_kols: campaign._count.campaign_kols,
        }));

        return c.json({
            success: true,
            data: reportData,
            pagination: Pagination({ page, limit, total }),
        });
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to fetch campaigns',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const getReportById = async (c: Context) => {
    const campaignId = Number(c.req.param('id'));

    if (!campaignId || isNaN(campaignId)) {
        return c.json(
            {
                success: false,
                message: 'campaign_id is required and must be a valid number.',
            },
            400
        );
    }

    const campaign = await prisma.campaigns.findUnique({
        where: { id: campaignId },
        include: {
            user: { select: { username: true } },
            kol_types: { select: { name: true, min_followers: true, max_followers: true } },
        },
    });

    if (!campaign) {
        return c.json(
            {
                success: false,
                message: `Campaign with ID ${campaignId} not found.`,
            },
            404
        );
    }

    try {
        const kolList = await prisma.campaign_kol.findMany({
            where: { campaign_id: campaignId },
            include: {
                kol: { select: { id: true, name: true } },
            },
        });

        const reports = await prisma.kol_reports.findMany({
            where: { campaign_id: campaignId },
        });

        const data = kolList.map((item) => {
            const report = reports.find((r) => r.kol_id === item.kol.id);
            return {
                kol_id: item.kol.id,
                kol_name: item.kol.name,
                report: report || null,
            };
        });

        data.sort((a, b) => {
            if (!a.report) return 1;
            if (!b.report) return -1;
            if (a.report.ranking === null) return 1;
            if (b.report.ranking === null) return -1;
            return a.report.ranking - b.report.ranking;
        });

        return c.json(
            {
                success: true,
                campaign: safeJson(campaign),
                data: safeJson(data),
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to fetch reports.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export const deleteReport = async (c: Context) => {
    const id = parseInt(c.req.param('id'));

    if (!id) {
        return c.json(
            {
                success: false,
                message: 'Report ID is required.',
            },
            400
        );
    }

    try {
        const existingReport = await prisma.kol_reports.findUnique({
            where: { id },
        });

        if (!existingReport) {
            return c.json(
                {
                    success: false,
                    message: 'Report not found.',
                },
                404
            );
        }

        const campaignId = existingReport.campaign_id;

        await prisma.kol_reports.delete({ where: { id } });

        await calculateWPScores(campaignId);

        return c.json(
            {
                success: true,
                message: 'KOL report successfully deleted.',
            },
            200
        );
    } catch (err) {
        return c.json(
            {
                success: false,
                message: 'Failed to delete KOL report.',
                error: err instanceof Error ? err.message : String(err),
            },
            500
        );
    }
};

export async function calculateWPScores(campaignId: number) {
    const reports = await prisma.kol_reports.findMany({
        where: { campaign_id: campaignId },
        include: { kol: true },
    });

    if (!reports.length) {
        throw new Error('No reports found for this campaign');
    }

    const weights = {
        like: 0.15,
        comment: 0.2,
        share: 0.15,
        save: 0.15,
        er: 0.35,
    };

    const results = reports.map((r) => {
        const like = Number(r.like_count);
        const comment = Number(r.comment_count);
        const share = Number(r.share_count);
        const save = Number(r.save_count);

        const s_i =
            Math.pow(like, weights.like) *
            Math.pow(comment, weights.comment) *
            Math.pow(share, weights.share) *
            Math.pow(save, weights.save) *
            Math.pow(r.er, weights.er);

        return {
            kol_id: r.kol_id,
            kol_name: r.kol?.name ?? 'Unknown',
            s_i,
        };
    });

    const totalS = results.reduce((sum, r) => sum + r.s_i, 0);

    const ranked = results
        .map((r) => ({
            ...r,
            final_score: r.s_i / totalS,
        }))
        .sort((a, b) => b.final_score - a.final_score)
        .map((r, i) => ({
            ...r,
            ranking: i + 1,
        }));

    await Promise.all(
        ranked.map((r) =>
            prisma.kol_reports.update({
                where: {
                    campaign_id_kol_id: {
                        campaign_id: campaignId,
                        kol_id: r.kol_id,
                    },
                },
                data: {
                    final_score: r.final_score,
                    ranking: r.ranking,
                },
            })
        )
    );

    return ranked;
}

export const exportCampaignReport = async (c: Context) => {
    try {
        const campaignId = Number(c.req.param('id'));

        if (!campaignId || isNaN(campaignId)) {
            return c.text('Invalid campaign ID', 400);
        }

        const response = await getReportById(c);
        const json: KolReportGenerate = await response.json();

        if (!json.success) {
            return new Response(JSON.stringify(json), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { campaign, data } = json;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Campaign Report');
        worksheet.addRow(['KOLABRY']);
        worksheet.getCell(`A1`).font = {
            bold: true,
            italic: true,
            size: 18,
            color: { argb: 'FF2F80ED' },
        };
        worksheet.mergeCells(`A1:B1`);
        worksheet.addRow(['Campaign Overview']);
        worksheet.getCell(`A2`).font = { bold: true, size: 12 };
        worksheet.mergeCells(`A2:B2`);
        worksheet.addRow([]);

        const formatNumber = (num: number) => num.toLocaleString('id-ID');

        const kolTypeName = campaign.kol_types.name;
        const min = campaign.kol_types.min_followers;
        const max = campaign.kol_types.max_followers;

        const followersRange = max ? `${formatNumber(min)} - ${formatNumber(max)}` : `${formatNumber(min)}+`;

        const kolTypeValue = `${kolTypeName} (${followersRange})`;

        const overviewPairs = [
            ['Campaign Name', campaign.name],
            ['Brand', campaign.user.username],
            ['KOL Type', kolTypeValue],
            ['Target Gender', campaign.target_gender],
            ['Target Age', campaign.target_age_range.replace('AGE_', '').replace('_', ' - ')],
            ['Target Age Percentage (%)', Number(campaign.target_gender_min)],
            ['Target ER (%)', Math.round(Number(campaign.target_engagement) * 100) / 100],
            ['Target Reach', Number(campaign.target_reach)],
            ['Start Date', format(new Date(campaign.start_date), 'dd MMMM yyyy', { locale: id })],
            ['End Date', format(new Date(campaign.end_date), 'dd MMMM yyyy', { locale: id })],
        ];

        let rowIndex = 3;
        for (const [label, value] of overviewPairs) {
            worksheet.getCell(`B${rowIndex}`).value = label;
            worksheet.getCell(`C${rowIndex}`).value = typeof value === 'number' ? value : String(value);
            worksheet.getCell(`C${rowIndex}`).alignment = { horizontal: 'left', vertical: 'middle' };
            worksheet.mergeCells(`C${rowIndex}:E${rowIndex}`);
            worksheet.getCell(`B${rowIndex}`).font = { bold: true };
            worksheet.getColumn(2).width = 30;
            rowIndex++;
        }

        worksheet.addRow([]);

        const titleRow = worksheet.addRow(['KOL Report Performance']);
        titleRow.font = { bold: true, size: 12 };
        worksheet.mergeCells(`A${titleRow.number}:B${titleRow.number}`);

        for (let i = 3; i <= 12; i++) {
            worksheet.getColumn(i).width = 15;
        }

        const headerRow = worksheet.addRow([
            'No',
            'KOL Name',
            'Like',
            'Comment',
            'Share',
            'Save',
            'Engagement',
            'Reach',
            'ER (%)',
            'CPE (Rp)',
            'Score',
            'Ranking',
        ]);

        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDCE6F1' },
            };
        });

        data.forEach((item, i) => {
            const r = item.report;

            const dataRow = worksheet.addRow([
                i + 1,
                item.kol_name,
                r?.like_count ? Number(r.like_count) : '-',
                r?.comment_count ? Number(r.comment_count) : '-',
                r?.share_count ? Number(r.share_count) : '-',
                r?.save_count ? Number(r.save_count) : '-',
                r?.engagement ? Number(r.engagement) : '-',
                r?.reach ?? '-',
                r?.er !== undefined ? Math.round(Number(r.er) * 100) / 100 : '-',
                r?.cpe !== undefined ? Number(r.cpe) : '-',
                r?.save_count && r?.final_score !== undefined ? Number(r.final_score.toFixed(4)) : '-',
                r?.ranking ?? '-',
            ]);

            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };

                if (colNumber === 1 || colNumber === 12) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
            });
        });

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.font = {
                    ...cell.font,
                    name: 'Arial',
                };
                row.height = 20;
                cell.alignment = {
                    ...cell.alignment,
                    vertical: 'middle',
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="campaign_${campaignId}_report.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } finally {
        await prisma.$disconnect();
    }
};
