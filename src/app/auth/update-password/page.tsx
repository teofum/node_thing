import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Reset Your Password</h2>
          <p className="text-sm">Please enter your new password below.</p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
    </div>
  );
}