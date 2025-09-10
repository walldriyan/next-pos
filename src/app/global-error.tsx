// src/app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              Something went wrong globally!
            </h2>
            <p className="text-red-600 mb-4">{error.message}</p>
            <button
              onClick={() => reset()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}