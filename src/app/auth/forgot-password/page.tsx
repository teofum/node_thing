import { forgotPasswordAction } from "@/lib/auth/actions";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import Link from "next/link";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  if (params.message) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Reset Your Password</h2>
          <p className="text-sm">
            Type in your email and we&apos;ll send you a link to reset your
            password
          </p>
        </div>
        <div className="glass glass-border p-6 w-96 mx-auto rounded-2xl">
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="mb-4 text-green-600">{params.message}</p>
          <p className="text-sm">
            If you registered using your email and password, you will receive a
            password reset email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Reset Your Password</h2>
        <p className="text-sm">
          Type in your email and we&apos;ll send you a link to reset your
          password
        </p>
      </div>

      <div className="glass glass-border p-6 w-96 mx-auto rounded-2xl">
        <form action={forgotPasswordAction} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm/3 font-semibold mb-2"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="w-full"
              placeholder="john@example.com"
            />
          </div>
          {params.error && (
            <p className="text-sm text-red-600">{params.error}</p>
          )}
          <Button
            type="submit"
            className="w-full p-2 bg-stone-800 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Send reset email
          </Button>
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link href="/auth/login" className="underline">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
