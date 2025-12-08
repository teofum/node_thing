import { ReactNode } from "react";

import { LinkButton } from "@/ui/button";
import { AuthButton } from "@/app/auth/components/auth-button";
import Image from "next/image";

export default function LayoutWithNav({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div>
      <div className="sticky top-0 pt-3 px-6 z-50">
        <div className="absolute inset-0 backdrop-blur-sm mask-b-from-white mask-b-from-25% mask-b-to-transparent" />
        <nav className="mx-auto max-w-6xl rounded-xl overflow-hidden relative z-10">
          <div className="glass glass-border rounded-xl w-full p-2 flex flex-row items-center gap-6">
            <LinkButton href="/" size="md" variant="ghost" icon>
              <Image src="/logo.svg" alt="node_thing" width={100} height={33} />
            </LinkButton>

            <div className="flex flex-row gap-2 text-sm/4 font-medium">
              <LinkButton href="/marketplace" variant="ghost">
                Marketplace
              </LinkButton>
            </div>

            <div className="ml-auto pr-3">
              <AuthButton />
            </div>
          </div>
        </nav>
      </div>
      <main>{children}</main>
    </div>
  );
}
