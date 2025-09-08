import { signOutAction } from "@/lib/auth/actions";

export function LogoutButton() {
  return (
    <form action={signOutAction} className="inline">
      <button
        type="submit"
        className="bg-stone-800 px-2 py-1 rounded hover:bg-blue-700 text-white text-sm cursor-pointer"
      >
        Logout
      </button>
    </form>
  );
}
