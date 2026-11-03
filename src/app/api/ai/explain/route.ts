import { NextRequest, NextResponse } from "next/server";
import { explainRepository } from "@/lib/ai/explainer";
import { verifyRequestAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Direct API authentication guard
  if (!(await verifyRequestAuth(request))) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Session authentication required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { owner, name, description, language, topics, stars, readme } = body;

    if (!owner || !name) {
      return NextResponse.json(
        { success: false, error: "Missing repository owner or name." },
        { status: 400 }
      );
    }

    const explanation = await explainRepository({
      owner,
      name,
      description: description || null,
      language: language || null,
      topics: topics || [],
      stars: stars || 0,
      readme: readme || null,
    });

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI explanation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
