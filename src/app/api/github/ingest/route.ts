import { NextRequest, NextResponse } from "next/server";
import { verifyRequestAuth } from "@/lib/auth";
import { runIngestion } from "@/lib/services/ingestion";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!(await verifyRequestAuth(request))) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Session authentication required." },
      { status: 401 }
    );
  }

  try {
    const result = await runIngestion();
    return NextResponse.json({
      success: true,
      message: "Ingestion executed successfully.",
      summary: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ingestion execution failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
