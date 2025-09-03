"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-stone-800 px-2 py-1 rounded hover:bg-blue-700 text-white text-sm cursor-pointer"
    >
      Logout
    </button>
  );
}