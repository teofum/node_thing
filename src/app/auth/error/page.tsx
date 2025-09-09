export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Sorry, something went wrong.
          </h2>
          {params?.error ? (
            <p className="text-sm text-gray-600">Code error: {params.error}</p>
          ) : (
            <p className="text-sm text-gray-600">
              An unspecified error occurred.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
