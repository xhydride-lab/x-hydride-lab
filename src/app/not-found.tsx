import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-graphite-950 px-6 py-20 text-graphite-100">
      <div className="panel w-full max-w-md px-8 py-10">
        <p className="text-eyebrow">Error · 404</p>
        <h1 className="mt-2 text-display font-semibold text-graphite-50">
          Page not found
        </h1>
        <p className="mt-3 text-body text-graphite-400">
          The requested resource does not exist in this research preview.
        </p>
        <Link
          href="/"
          className="focus-ring mt-6 inline-flex h-9 items-center justify-center rounded-sharp border border-graphite-700 bg-graphite-900 px-4 text-caption text-graphite-100 transition-colors hover:border-graphite-600"
        >
          Return to landing page
        </Link>
      </div>
    </main>
  );
}
