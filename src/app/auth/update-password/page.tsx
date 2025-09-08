import { UpdatePasswordForm } from "@/app/auth/components/update-password-form";

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
      <UpdatePasswordForm error={params.error} />
    </div>
  );
}
