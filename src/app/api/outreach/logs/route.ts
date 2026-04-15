import { backendJson, extractError } from "@/lib/backend-proxy";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessionUser = session.user as { id?: string; isAdmin?: boolean };

  const url = new URL(request.url);
  const run_id = url.searchParams.get("run_id")?.trim();
  const tail = url.searchParams.get("tail")?.trim() || "200";

  let backendUrl = `/api/outreach/logs?tail=${tail}`;
  if (run_id) backendUrl += `&run_id=${encodeURIComponent(run_id)}`;

  try {
    const result = await backendJson(
      backendUrl,
      { method: "GET" },
      { userId: sessionUser.id, isAdmin: sessionUser.isAdmin === true }
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: extractError(result.payload, "Unable to load outreach logs.") },
        { status: result.status || 500 }
      );
    }

    const payload =
      result.payload && typeof result.payload === "object" && !Array.isArray(result.payload)
        ? (result.payload as Record<string, unknown>)
        : {};
    const logs = Array.isArray(payload.logs)
      ? payload.logs
      : Array.isArray(payload.lines)
        ? payload.lines
        : [];

    return NextResponse.json({ ...payload, logs, lines: logs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error loading logs" }, { status: 500 });
  }
}
