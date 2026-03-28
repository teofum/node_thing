import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const users = await request.json();

  // Use service role for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const created = [];
  const existing = [];

  for (const user of users) {
    const { email, password } = user;
    const username = email.split("@")[0];

    // Check if user exists
    const { data: existingAuth } = await supabase.auth.admin.listUsers();
    const userExists = existingAuth?.users?.some((u) => u.email === email);

    if (userExists) {
      existing.push(email);
      continue;
    }

    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        full_name: username,
      },
    });

    if (error) {
      console.error(`Failed to create ${email}:`, error.message);
      continue;
    }

    // Create profile
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username,
      });
    }

    created.push(email);
  }

  return NextResponse.json({
    created: created.length,
    existing: existing.length,
    total: users.length,
  });
}
