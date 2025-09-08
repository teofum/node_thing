import { SignUpForm } from "@/app/auth/components/signup-form";
import Link from "next/link";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Create your account</h2>
      </div>
      <SignUpForm error={params.error} />
      <div className="text-center">
        <Link href="/auth/login" className="text-sm underline">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  );
}
