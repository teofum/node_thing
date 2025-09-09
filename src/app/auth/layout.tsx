import { LinkButton } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <LinkButton variant="ghost" href="/" className="absolute top-4 left-4">
        <LuArrowLeft />
        Back
      </LinkButton>

      <div className="min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
