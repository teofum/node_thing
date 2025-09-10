import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        if (next && next.startsWith("/")) {
          return NextResponse.redirect(
            `${origin}/onboarding?next=${encodeURIComponent(next)}`,
          );
        } else {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/login?error=Invalid or expired link`,
  );
}
