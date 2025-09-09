import { LinkButton } from "@/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/upload");
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-neutral-400 mb-4">TODO: upload form</p>
        <LinkButton href="/marketplace" variant="outline">
          Cancel
        </LinkButton>
      </div>
    </div>
  );
}
