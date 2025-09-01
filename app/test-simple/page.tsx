export default function TestSimplePage() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900">Simple Test Page</h1>
      <p className="mt-4 text-lg text-gray-700">
        This page has no providers or complex logic. If this shows up, the issue is with the Context providers.
      </p>
    </div>
  );
}