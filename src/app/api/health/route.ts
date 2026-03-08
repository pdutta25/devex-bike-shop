export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

// SECURITY (V-19): Only return status — do not leak uptime or server details
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
