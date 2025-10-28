import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    console.log("🔒 Middleware check:", {
        path: request.nextUrl.pathname,
        hasToken: !!token,
        tokenData: token ? { email: token.email, hasBackendToken: !!token.token } : null
    });

    // Redirect to signin if no token
    if (!token) {
        console.log("❌ No token, redirecting to signin");
        const signInUrl = new URL('/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Optional: Check for admin routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const isAdmin = (token as any).isAdmin || false;
        if (!isAdmin) {
            console.log("❌ Not admin, redirecting");
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

// Configure which routes to protect
export const config = {
    matcher: [
        '/dashboard/:path*',
        // '/api/posts/:path*', // Disabled - backend API not working
        // Add other protected routes here
        // '/profile/:path*',
    ],
};
