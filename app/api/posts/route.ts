import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../auth/[...nextauth]/route";
import { isTokenExpired } from "@/lib/jwt-utils";

interface SessionWithToken {
    user: {
        name?: string;
        email?: string;
        image?: string;
        id?: string;
    };
    expires: string;
    token: string; // This is the property we need!
}

export async function GET(request: NextRequest) {
    const jwtToken = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    console.log("🔍 GET /api/posts - JWT token:", {
        hasToken: !!jwtToken,
        tokenType: typeof jwtToken,
        tokenKeys: jwtToken ? Object.keys(jwtToken) : []
    });

    if (!jwtToken) {
        console.error("❌ GET /api/posts - No JWT token found");
        return NextResponse.json({ error: "Unauthorized - Not logged in" }, { status: 401 });
    }

    // Extract the actual token string from the JWT token object
    const token = jwtToken.token as string;

    console.log("🔍 Token extracted:", {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });

    if (!token) {
        console.error("❌ GET /api/posts - JWT exists but no token property found");
        return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 });
    }

    // Check if token is expired
    const expired = isTokenExpired(token);
    console.log("🔍 Token validation:", { expired });

    if (expired) {
        console.error("❌ GET /api/posts - Token is expired");
        return NextResponse.json({ error: "Unauthorized - Token expired" }, { status: 401 });
    }

    try {
        const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`;
        const authHeader = `Bearer ${token}`;

        console.log("🌐 Fetching from backend:", backendUrl);
        console.log("🔑 Authorization header:", authHeader.substring(0, 50) + "...");
        console.log("🔑 Token length:", token.length);
        console.log("🔑 Token starts with:", token.substring(0, 20));

        const headers = {
            Authorization: authHeader,
            "Content-Type": "application/json",
        };

        console.log("📤 Request headers:", Object.keys(headers));

        const response = await fetch(backendUrl, {
            method: "GET",
            headers,
        });

        console.log("📡 Backend response status:", response.status);
        console.log("📡 Backend response headers:", Object.fromEntries(response.headers.entries()));

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

        try {
            const data = JSON.parse(responseText);
            console.log("✅ Successfully fetched posts:", Array.isArray(data) ? data.length : 'not an array');
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("❌ Failed to parse backend response as JSON:", parseError);
            console.error("Response was:", responseText.substring(0, 500));
            return NextResponse.json({
                error: "Backend returned invalid JSON",
                details: responseText.substring(0, 200)
            }, { status: 500 });
        }
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
        hasAccessToken: !!session?.token,
    });

    // 3. Check for 'session.accessToken'
    if (!session) {
        console.error("❌ POST /api/posts - No session found");
        return NextResponse.json({ error: "Unauthorized - Not logged in" }, { status: 401 });
    }

    if (!session?.token) {
        console.error("❌ POST /api/posts - Session exists but no accessToken");
        return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 });
    }

    // 4. Check if token is expired
    if (isTokenExpired(session.token)) {
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
                "Authorization": `Bearer ${session.token}`,
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