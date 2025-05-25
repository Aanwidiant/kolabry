import { Context, Next } from 'hono';

export const checkRole = (allowedRoles: string[]) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user');

        if (!allowedRoles.includes(user.role)) {
            return c.json(
                {
                    success: false,
                    error: 'Access denied: You do not have permission',
                },
                403
            );
        }

        await next();
    };
};

export const isAdmin = checkRole(['ADMIN']);

export const isKOLManager = checkRole(['KOL_MANAGER']);

export const isBrand = checkRole(['BRAND']);

// menyesuaikan nanti
// export const isAdminOrKOLManager = checkRole(["ADMIN", "KOL_MANAGER"]);
