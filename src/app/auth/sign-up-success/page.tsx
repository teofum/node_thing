export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Thank you for signing up!</h2>
          <p className="text-gray-600 mb-4">Check your email to confirm</p>
          <p className="text-sm text-gray-500">
            You&apos;ve successfully signed up. Please check your email to
            confirm your account before signing in.
          </p>
        </div>
      </div>
    </div>
  );
}
