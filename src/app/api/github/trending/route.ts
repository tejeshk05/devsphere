import { NextRequest, NextResponse } from "next/server";
import { fetchTrendingRepos } from "@/lib/github";
import { CategoryId, TimeFilter } from "@/types/github";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") as CategoryId) || "ai";
    const timeframe = (searchParams.get("timeframe") as TimeFilter) || "daily";
    const query = searchParams.get("q") || undefined;

    const result = await fetchTrendingRepos(category, timeframe, query);

    return NextResponse.json(
      {
        success: true,
        category,
        timeframe,
        count: result.repos.length,
        repos: result.repos,
        rateLimitRemaining: result.rateLimitRemaining,
        cached: result.cached,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch repositories";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

