import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="min-h-screen relative">
      <Link
        href="/"
        className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </Link>
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-sm text-gray-600">
              We&apos;ve sent you a verification link. Click the link in your
              email to activate your account.
            </p>
          </div>
          <div className="text-center">
            <Link href="/auth/login" className="text-sm underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
