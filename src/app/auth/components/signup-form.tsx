import { signUpAction } from "@/lib/auth/actions";
import { OAuthButtons } from "./oauth-buttons";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";

export function SignUpForm({ error }: { error?: string }) {
  return (
    <div className="glass glass-border p-6 w-96 mx-auto rounded-2xl">
      <OAuthButtons mode="signup" />

      <div className="font-medium mt-6 mb-3 text-center">
        or sign up using email
      </div>

      <form action={signUpAction} className="space-y-6">
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
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm/3 font-semibold mb-2"
          >
            Password
          </label>
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
          Sign up
        </Button>
      </form>
    </div>
  );
}
