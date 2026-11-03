import { NextRequest, NextResponse } from "next/server";
import { fetchTrendingRepos } from "@/lib/github";
import { verifyRequestAuth } from "@/lib/auth";
import { CategoryId, TimeFilter } from "@/types/github";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Direct API authentication guard
  if (!(await verifyRequestAuth(request))) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Session authentication required." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") as CategoryId) || "ai";
    const timeframe = (searchParams.get("timeframe") as TimeFilter) || "daily";
    const mode = (searchParams.get("mode") as "velocity" | "all-time") || "velocity";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const query = searchParams.get("q") || undefined;

    const result = await fetchTrendingRepos(category, timeframe, query, mode, page);

    return NextResponse.json(
      {
        success: true,
        category,
        timeframe,
        mode,
        page,
        count: result.repos.length,
        hasMore: result.repos.length === 30,
        repos: result.repos,
        rateLimitRemaining: result.rateLimitRemaining,
        cached: result.cached,
        rankingMethodology: result.rankingMethodology,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch repositories.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
