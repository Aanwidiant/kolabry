import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = new Set(['/', '/login']);

const roleAccessMap: Record<string, string[]> = {
    ADMIN: ['/dashboard', '/users', '/reports'],
    KOL_MANAGER: ['/dashboard', '/kols', '/campaign-type', '/campaigns', '/reports'],
    BRAND: ['/dashboard', '/reports'],
};

async function verifyToken(token: string) {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;
    const { pathname } = req.nextUrl;
    const cleanPath = pathname.toLowerCase().replace(/\/$/, '') || '/';

    if (cleanPath.startsWith('/_next') || cleanPath.startsWith('/api') || cleanPath === '/favicon.ico') {
        return NextResponse.next();
    }

    if (!token && !publicRoutes.has(cleanPath)) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (token && publicRoutes.has(cleanPath)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (token) {
        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        const role = (payload.role as string).toUpperCase();
        const allowedPaths = roleAccessMap[role] ?? [];

        const isAllowed = allowedPaths.some(
            (basePath) => cleanPath === basePath || cleanPath.startsWith(`${basePath}/`)
        );

        if (!isAllowed) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/dashboard/:path*',
        '/users/:path*',
        '/kols/:path*',
        '/campaign-type/:path*',
        '/campaigns/:path*',
        '/reports/:path*',
    ],
};
