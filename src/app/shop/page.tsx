import Link from "next/link";
import { categories, products } from "@/data/catalog";
import { ShopClient } from "./shop-client";

type SearchParams = {
  category?: string;
  q?: string;
  sort?: string;
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const category = (sp.category ?? "").trim();
  const q = (sp.q ?? "").trim();
  const sort = (sp.sort ?? "name-asc").trim();

  // Validate category against known categories (prevents invalid URL values breaking UI)
  const validCategory = categories.some((c) => c.id === category) ? category : "";

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Shop</h1>
            <p className="text-gray-600">Browse all items and order via WhatsApp.</p>
          </div>

          <Link href="/" className="text-sm underline">
            Back to home
          </Link>
        </div>
      </header>

      <div className="mt-6">
        <ShopClient
          categories={categories}
          products={products}
          initialCategory={validCategory}
          initialQuery={q}
          initialSort={sort}
        />
      </div>
    </main>
  );
}
