import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = new Set(["/", "/login"]);

export function middleware(req: NextRequest) {
    const token = req.cookies.get("auth_token")?.value;
    const { pathname } = req.nextUrl;

    const cleanPath = pathname.toLowerCase().replace(/\/$/, "") || "/";

    if (
        cleanPath.startsWith("/_next") ||
        cleanPath.startsWith("/api") ||
        cleanPath === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    if (!token && !publicRoutes.has(cleanPath)) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && publicRoutes.has(cleanPath)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}


export const config = {
    matcher: [
        "/",
        "/login",
        "/dashboard/:path*",
        "/users/:path*",
        "/kols/:path*",
        "/kol-type/:path*",
        "/campaigns/:path*",
        "/reports/:path*",
    ],
};
