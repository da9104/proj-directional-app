import { NextRequest, NextResponse } from "next/server";

type Post = {
    id: string;
    userId: string;
    title: string;
    body: string;
    category: string;
    tags: string[];
    createdAt: string;
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');

    try {
        // Fetch from backend with proper count parameter
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mock/posts?count=${count}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            throw new Error(`Backend responded with status: ${res.status}`);
        }

        const posts = await res.json();
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts from backend:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts from backend' },
            { status: 500 }
        );
    }
}