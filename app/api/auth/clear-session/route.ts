import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();

    // Clear NextAuth session cookies
    const cookieNames = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        'next-auth.csrf-token',
        '__Host-next-auth.csrf-token',
    ];

    cookieNames.forEach(name => {
        cookieStore.delete(name);
    });

    return NextResponse.json({
        message: "Session cookies cleared. Please sign in again.",
        clearedCookies: cookieNames
    });
}
