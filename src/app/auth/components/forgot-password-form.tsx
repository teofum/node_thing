import Link from "next/link";
import { forgotPasswordAction } from "@/lib/auth/actions";

export function ForgotPasswordForm({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (message) {
    return (
      <div className="border p-6 w-96 mx-auto rounded-md">
        <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
        <p className="mb-4 text-green-600">{message}</p>
        <p className="text-sm">
          If you registered using your email and password, you will receive a
          password reset email.
        </p>
      </div>
    );
  }

  return (
    <div className="border p-6 w-96 mx-auto rounded-md">
      <form action={forgotPasswordAction} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full p-3 border rounded-md"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full p-2 bg-stone-800 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Send reset email
        </button>
        <div className="text-center text-sm">
          Remember your password?{" "}
          <Link href="/auth/login" className="underline">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
