import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { isTokenExpired } from "@/lib/jwt-utils";

interface SessionWithToken {
    user: {
        name?: string;
        email?: string;
        image?: string;
        id?: string;
    };
    expires: string;
    accessToken: string;
}

export async function GET() {
    const session = await getServerSession(authOptions) as SessionWithToken;
    const token = session.accessToken;

    // Check if token is expired
    const expired = isTokenExpired(session.accessToken);
    console.log("🔍 Token validation:", { expired });

    if (expired) {
        console.error("❌ GET /api/posts - Token is expired");
        return NextResponse.json({ error: "Unauthorized - Token expired" }, { status: 401 });
    }
    if (!session || !session.accessToken) {
        // If you see this, Step 1 failed.
        console.error("DEBUG: Session or accessToken not available.");
        return NextResponse.json({ error: "No session token" }, { status: 401 });
    }

    // 🎯 CRITICAL DEBUGGING LINE 🎯
    console.log("DEBUG: Token retrieved from session (first 20 chars):", (session.accessToken as string).substring(0, 20));

    try {
        const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`;
        console.log("🌐 Fetching from backend:", backendUrl);

        const headers = {
            "Authorization": `Bearer ${token}`,
            'accept': 'application/json',
            "Content-Type": "application/json",
        };

        const response = await fetch(backendUrl, {
            method: "GET",
            headers,
        });

        const responseText = await response.text();
        console.log("📡 Backend raw response (first 200 chars):", responseText.substring(0, 200));

        if (!response.ok) {
            console.error("❌ Backend error response:", responseText.substring(0, 500));
            try {
                const error = JSON.parse(responseText);
                return NextResponse.json(error, { status: response.status });
            } catch {
                return NextResponse.json({
                    error: "Backend returned non-JSON response",
                    details: responseText.substring(0, 200),
                    status: response.status
                }, { status: response.status });
            }
        }
        const data = JSON.parse(responseText);
        console.log("✅ Successfully fetched posts:", Array.isArray(data) ? data.length : 'not an array');
        return NextResponse.json(data);

    } catch (error) {
        console.error("💥 Error fetching posts:", error);
        return NextResponse.json(
            { error: "Failed to fetch posts", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions) as SessionWithToken;

    console.log("🔍 POST /api/posts - Session check:", {
        hasSession: !!session,
        hasUser: !!session?.user?.email,
        userEmail: session?.user?.email,
        hasAccessToken: !!session?.accessToken,
    });

    if (!session) {
        console.error("❌ POST /api/posts - No session found");
        return NextResponse.json({ error: "Unauthorized - Not logged in" }, { status: 401 });
    }

    if (!session?.accessToken) {
        console.error("❌ POST /api/posts - Session exists but no accessToken");
        return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 });
    }

    // 4. Check if token is expired
    if (isTokenExpired(session.accessToken)) {
        console.error("❌ POST /api/posts - Token is expired");
        return NextResponse.json({ error: "Unauthorized - Token expired" }, { status: 401 });
    }

    try {
        const body = await request.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 }
        );
    }
}