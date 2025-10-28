import { NextResponse } from "next/server";
//app/api/mock/weekly-mood-trend
export async function GET() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/mock/weekly-mood-trend`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!res.ok) {
            throw new Error(`Backend responded with status: ${res.status}`);
        }

        const data = await res.json();

        console.log(data)
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching coffee brands from backend:", error);
        return NextResponse.json(
            { error: "Failed to fetch the data from backend" },
            { status: 500 }
        );
    }
}
