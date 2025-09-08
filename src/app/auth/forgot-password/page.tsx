import { ForgotPasswordForm } from "@/app/auth/components/forgot-password-form";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Reset Your Password</h2>
        <p className="text-sm">
          Type in your email and we&apos;ll send you a link to reset your
          password
        </p>
      </div>
      <ForgotPasswordForm error={params.error} message={params.message} />
    </div>
  );
}
