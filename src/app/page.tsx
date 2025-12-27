import Link from "next/link";
import { categories, products } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">ToksMimi Foods</h1>
        <p className="text-gray-600">Afro-Caribbean & Nigerian groceries.</p>
        <div className="flex gap-3">
          <Link className="rounded-lg bg-black px-4 py-2 text-white" href="/shop">
            Shop now
          </Link>
          <Link className="rounded-lg border px-4 py-2" href="/contact">
            Contact
          </Link>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Shop by category</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
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

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Popular items</h2>
          <Link href="/shop" className="text-sm underline">
            View all
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
