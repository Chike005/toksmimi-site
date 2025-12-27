import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-gray-600">
        The product you are looking for does not exist or may have been removed.
      </p>

      <div className="mt-6 flex gap-3">
        <Link className="rounded-lg bg-black px-4 py-2 text-white" href="/shop">
          Back to shop
        </Link>
        <Link className="rounded-lg border px-4 py-2" href="/">
          Home
        </Link>
      </div>
    </main>
  );
}
