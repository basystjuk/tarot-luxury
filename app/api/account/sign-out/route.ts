/**
 * Sign-out endpoint. Posted by the cabinet's "Sign out" button.
 *
 * Supabase clears the auth cookies via `signOut()` server-side. We redirect
 * the user to the home page in their current locale.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supa = await getSupabaseServer();
  if (supa) await supa.auth.signOut();

  // Reconstruct redirect target: respect the `lang` form field if present.
  let lang = "uk";
  try {
    const fd = await req.formData();
    const v = fd.get("lang");
    if (typeof v === "string" && ["uk", "ru", "en"].includes(v)) lang = v;
  } catch { /* not multipart — fine */ }
  return NextResponse.redirect(new URL(`/${lang}`, req.url), 303);
}
