/**
 * Account cabinet (Phase В).
 *
 * Server component — checks the session, redirects to /sign-in if absent.
 * The actual editor is a client component (`./_cabinet`) that uses the
 * browser Supabase client for live save feedback.
 */

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { CabinetClient } from "./_cabinet";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supa = await getSupabaseServer();
  if (!supa) {
    // Supabase not configured — show a placeholder rather than a redirect loop.
    return (
      <section className="pt-36 pb-24 bg-[#FDFBF7] min-h-[60vh]">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-[#7A6A58] italic">Account area is being set up — please come back soon.</p>
        </div>
      </section>
    );
  }
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    redirect(`/${lang}/account/sign-in`);
  }
  // Pre-fetch the profile so the client doesn't show a loading flash.
  const { data: profile } = await supa
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return <CabinetClient initialProfile={profile ?? null} email={user.email ?? ""} lang={lang} />;
}
