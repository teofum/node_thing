import { updatePasswordAction } from "../actions";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Reset Your Password</h2>
        <p className="text-sm">Please enter your new password below.</p>
      </div>

      <div className="glass glass-border p-6 w-96 mx-auto rounded-2xl">
        <form action={updatePasswordAction} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm/3 font-semibold mb-2"
            >
              New password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm/3 font-semibold mb-2"
            >
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full"
            />
          </div>
          {params.error && (
            <p className="text-sm text-red-600">{params.error}</p>
          )}
          <Button
            type="submit"
            className="w-full p-2 bg-stone-800 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Save new password
          </Button>
        </form>
      </div>
    </div>
  );
}
