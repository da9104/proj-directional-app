import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { decodeToken } from "@/lib/jwt-utils";

export async function GET() {
    const session = await getServerSession(authOptions);

    console.log("🔍 Full session object:", JSON.stringify(session, null, 2));

    if (!session) {
        return NextResponse.json({
            error: "No session found",
            message: "You need to sign in first"
        }, { status: 401 });
    }

    // Try to find the token in different places
    const tokenLocations = {
        'session.token': (session as any).token,
        'session.accessToken': (session as any).accessToken,
        'session.user.token': (session as any).user?.token,
        'session.user.accessToken': (session as any).user?.accessToken,
    };

    // Find which location has the token
    const foundToken = Object.entries(tokenLocations).find(([, value]) => value)?.[0];
    const token = tokenLocations[foundToken as keyof typeof tokenLocations];

    // Decode the token if found
    let decodedToken = null;
    if (token) {
        decodedToken = decodeToken(token);
    }

    return NextResponse.json({
        message: "Session debug info",
        hasSession: !!session,
        sessionKeys: Object.keys(session),
        userKeys: session.user ? Object.keys(session.user) : [],
        tokenLocations,
        foundTokenAt: foundToken || "NOT FOUND",
        tokenPreview: token ? `${token.substring(0, 30)}...` : "NO TOKEN",
        decodedToken,
        fullSession: session,
    });
}
