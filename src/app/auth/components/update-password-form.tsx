import { updatePasswordAction } from "@/lib/auth/actions";

export function UpdatePasswordForm({ error }: { error?: string }) {
  return (
    <div className="border p-6 w-96 mx-auto rounded-md">
      <form action={updatePasswordAction} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm mb-1">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full p-3 border rounded-md"
            placeholder="New password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full p-2 bg-stone-800 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Save new password
        </button>
      </form>
    </div>
  );
}
