/**
 * Auth callback — exchanges the `?code=` param from a magic-link email
 * for a session cookie, then redirects to /account.
 *
 * Supabase appends the code automatically when the user clicks the email
 * link. After exchange the session cookie is set on the response and
 * subsequent requests treat the user as authenticated.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest, ctx: { params: Promise<{ lang: string }> }) {
  const { lang } = await ctx.params;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? `/${lang}/account`;

  if (!code) {
    return NextResponse.redirect(new URL(`/${lang}/account/sign-in`, req.url));
  }

  const supa = await getSupabaseServer();
  if (!supa) {
    return NextResponse.redirect(new URL(`/${lang}/account/sign-in`, req.url));
  }
  const { error } = await supa.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/${lang}/account/sign-in?err=exchange`, req.url));
  }
  return NextResponse.redirect(new URL(next, req.url));
}
