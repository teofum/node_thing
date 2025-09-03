"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="border p-6 max-w-lg mx-auto rounded-md">
        <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
        <p className="mb-4">Password reset instructions sent</p>
        <p className="text-sm">
          If you registered using your email and password, you will receive
          a password reset email.
        </p>
      </div>
    );
  }

  return (
    <div className="border p-6 max-w-lg mx-auto rounded-md">
      <form onSubmit={handleForgotPassword} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md"
          />
        </div>
        {error && <p className="text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-2 bg-stone-800 text-white rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send reset email"}
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