import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { loadProductsFromCsv } from "@/data/products.server";


const WHATSAPP_NUMBER = "4474402277896"; // replace with your client number (no +)


function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}



type FeaturedCategory = {
  id: string;
  title?: string; // optional override
  maxItems?: number;
};

const FEATURED: FeaturedCategory[] = [
  { id: "rice", title: "Rice staples", maxItems: 4 },
  { id: "grains", title: "Grains & flour", maxItems: 4 },
  { id: "spices", title: "Spices & seasoning", maxItems: 4 },
  { id: "oils", title: "Cooking oils", maxItems: 4 },
  { id: "drinks", title: "Drinks", maxItems: 4 },
  { id: "snacks", title: "Snacks", maxItems: 4 },
];

export default async function HomePage() {
  const products = await loadProductsFromCsv();

  // Simple "popular" selection: in-stock first, then cheapest first (you can change logic later)
  const popular = products
    .filter((p) => p.inStock)
    .slice()
    .sort((a, b) => (a.priceGBP ?? 9999) - (b.priceGBP ?? 9999))
    .slice(0, 8);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* Hero */}
      <header className="space-y-3">
       <h1 className="text-2xl font-semibold">Afro-Caribbean & Nigerian Groceries</h1>

        <p className="text-gray-600">
          Afro-Caribbean & Nigerian groceries. Order via WhatsApp.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link className="rounded-lg bg-black px-4 py-2 text-white" href="/shop">
            Shop now
          </Link>
          <Link className="rounded-lg border px-4 py-2" href="/shop?sort=name-asc">
            Browse all
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <p className="font-medium text-slate-900 dark:text-slate-50">Delivery & Pickup</p>

          <div className="mt-2 space-y-2">
            <p>
              We deliver across Manchester and surrounding areas 🚚 Orders are usually processed same-day
              or next-day depending on availability.
            </p>
            <p>
              Prefer pickup? You can collect at a convenient time — we will confirm everything via WhatsApp.
            </p>
          </div>
        </div>

      </header>

      {/* Category grid */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Shop by category</h2>
          <Link href="/shop" className="text-sm underline">
            View all
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.id}`}
              className="rounded-xl border p-3 text-center hover:bg-gray-50"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular items */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Popular items</h2>
          <Link href="/shop" className="text-sm underline">
            View all
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {popular.map((p) => (
            <ProductCard key={p.id} product={p} showWhatsApp />
          ))}
        </div>
      </section>

      {/* Featured categories */}
      <section className="mt-12 space-y-10">
        {FEATURED.map((f) => {
          const items = products
            .filter((p) => p.categoryId === f.id && p.inStock)
            .slice(0, f.maxItems ?? 4);

          // If a featured category has no items yet, skip it
          if (items.length === 0) return null;

          return (
            <div key={f.id}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold">
                  {f.title ?? getCategoryName(f.id)}
                </h2>
                <Link href={`/shop?category=${f.id}`} className="text-sm underline">
                  View all
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} showWhatsApp />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Footer CTA */}
      <section className="mt-12 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Need help choosing items?</h2>
        <p className="mt-2 text-gray-600">
          Message us on WhatsApp with your shopping list and we’ll confirm price and availability.
        </p>
        <div className="mt-4">
          <Link className="rounded-lg bg-black px-4 py-2 text-white" href="/shop">
            Go to shop
          </Link>
        </div>
      </section>
    </main>
  );
}
