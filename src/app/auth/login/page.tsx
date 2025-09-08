import { LoginForm } from "@/app/auth/components/login-form";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Welcome back!</h2>
      </div>
      <LoginForm error={params.error} />
      <div className="text-center">
        <Link href="/auth/signup" className="text-sm underline">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </div>
  );
}
