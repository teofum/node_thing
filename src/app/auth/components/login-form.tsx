import Link from "next/link";
import { signInAction } from "@/lib/auth/actions";
import { OAuthButtons } from "./oauth-buttons";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

export function LoginForm({ error }: { error?: string }) {
  return (
    <div className="glass glass-border p-6 w-96 mx-auto rounded-2xl">
      <OAuthButtons mode="signin" />

      <div className="font-medium mt-6 mb-3 text-center">
        or sign in using email
      </div>

      <form action={signInAction} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm/3 font-semibold mb-2">
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
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="password" className="block text-sm/3 font-semibold">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm/3 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="w-full"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          className="w-full p-2 bg-stone-800 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Log in
        </Button>
      </form>
    </div>
  );
}
