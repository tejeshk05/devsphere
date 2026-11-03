import { NextRequest, NextResponse } from "next/server";
import { explainRepository } from "@/lib/ai/explainer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, name, description, language, topics, stars } = body;

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

