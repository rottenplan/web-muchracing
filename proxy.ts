import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const path = request.nextUrl.pathname;

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/tracks', '/sessions', '/categories', '/devices', '/setup-device'];

    // Check if current path starts with any protected route
    const isProtected = protectedRoutes.some(route => path.startsWith(route));

    if (isProtected && !token) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/tracks/:path*',
        '/sessions/:path*',
        '/categories/:path*',
        '/devices/:path*',
        '/setup-device/:path*',
    ],
};
