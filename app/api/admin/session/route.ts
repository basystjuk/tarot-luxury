import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

/** GET — whether this browser has a valid admin session. */
export async function GET(req: NextRequest) {
  return NextResponse.json({ signedIn: isAdminRequest(req) }, { headers: { "Cache-Control": "no-store" } });
}
