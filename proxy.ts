import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // Define public vs private paths
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isPublicFile = pathname.match(/\.(.*)$/) || pathname.startsWith('/api/') || pathname.startsWith('/_next/');

    if (isPublicFile) {
        return NextResponse.next();
    }

    // Redirect logic
    if (!token) {
        // If not logged in and trying to access anything but login/register, redirect to login
        if (!isAuthPage) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    } else {
        // If logged in and trying to access auth pages, redirect to dashboard
        if (isAuthPage) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // If logged in and at root, redirect to dashboard
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|logo.png|helmet-avatar.png).*)',
    ],
};
