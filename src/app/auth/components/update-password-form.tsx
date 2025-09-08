import { updatePasswordAction } from "@/lib/auth/actions";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";

export function UpdatePasswordForm({ error }: { error?: string }) {
  return (
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
            placeholder="New password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          className="w-full p-2 bg-stone-800 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Save new password
        </Button>
      </form>
    </div>
  );
}
