import { NextRequest, NextResponse } from "next/server";
import { GitHubRepo } from "@/types/github";
import { verifyRequestAuth } from "@/lib/auth";

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
    const owner = searchParams.get("owner");
    const name = searchParams.get("name");

    if (!owner || !name) {
      return NextResponse.json(
        { success: false, error: "Owner and repository name are required." },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "DevSphere-Discovery-Dashboard",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch Repository Metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers,
      next: { revalidate: 300 },
    });

    if (!repoRes.ok) {
      return NextResponse.json(
        { success: false, error: `GitHub API error: ${repoRes.statusText}` },
        { status: repoRes.status }
      );
    }

    const repo: GitHubRepo = await repoRes.json();

    // 2. Fetch README (optional)
    let readmeContent: string | null = null;
    try {
      const readmeRes = await fetch(
        `https://api.github.com/repos/${owner}/${name}/readme`,
        {
          headers,
          next: { revalidate: 300 },
        }
      );
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData.content) {
          readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
        }
      }
    } catch {
      // README is optional
    }

    return NextResponse.json({
      success: true,
      repo,
      readme: readmeContent,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load repository.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
