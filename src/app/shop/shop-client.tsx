"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
const WHATSAPP_NUMBER = "447845068117"; // replace with your client number (no +)
const BASKET_STORAGE_KEY = "toksmimi:basket:v1";



type BasketItem = {
  product: Product;
  qty: number;
};


function buildWhatsAppBasketMessage(items: BasketItem[]) {
  const lines: string[] = [];
  lines.push("Hi, I’d like to place an order from ToksMimi Foods:");
  lines.push("");

  items.forEach((it, idx) => {
    const unit = it.product.unit ? ` (${it.product.unit})` : "";
    const price =
      typeof it.product.priceGBP === "number" ? ` - £${it.product.priceGBP.toFixed(2)}` : "";
    lines.push(`${idx + 1}. ${it.product.name}${unit} x${it.qty}${price}`);
  });

  lines.push("");
  lines.push("Please confirm availability and total price. Thank you.");

  return lines.join("\n");
}


type Category = { id: string; name: string };

function setParam(urlParams: URLSearchParams, key: string, value: string) {
  if (!value) urlParams.delete(key);
  else urlParams.set(key, value);
}

function toPriceSortable(p: Product): number {
  // Put products with no price at the end for price sorts
  return typeof p.priceGBP === "number" ? p.priceGBP : Number.POSITIVE_INFINITY;
}

export function ShopClient(props: {
  categories: Category[];
  products: Product[];
  initialCategory: string;
  initialQuery: string;
  initialSort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  

  // UI state (initialized from URL via server props)
  const [query, setQuery] = useState(props.initialQuery);
  const [category, setCategory] = useState(props.initialCategory);
  const [sort, setSort] = useState(props.initialSort);

    const [basket, setBasket] = useState<Record<string, number>>({});

  function addToBasket(p: Product) {
    setBasket((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }));
  }

  function removeFromBasket(p: Product) {
    setBasket((prev) => {
      const next = { ...prev };
      const current = next[p.id] ?? 0;
      if (current <= 1) delete next[p.id];
      else next[p.id] = current - 1;
      return next;
    });
  }

  function clearBasket() {
    setBasket({});
  }

  const basketItems = useMemo(() => {
    const map = new Map(props.products.map((p) => [p.id, p]));
    return Object.entries(basket)
      .map(([id, qty]) => {
        const product = map.get(id);
        return product ? { product, qty } : null;
      })
      .filter(Boolean) as { product: Product; qty: number }[];
  }, [basket, props.products]);

  const basketCount = basketItems.reduce((sum, i) => sum + i.qty, 0);

  const whatsappHref =
    basketItems.length === 0
      ? ""
      : `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          buildWhatsAppBasketMessage(basketItems)
        )}`;


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = props.products.slice();

    if (category) list = list.filter((p) => p.categoryId === category);

    if (q) {
      list = list.filter((p) => {
        const hay = `${p.name} ${p.unit ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    switch (sort) {
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        list.sort((a, b) => toPriceSortable(a) - toPriceSortable(b));
        break;
      case "price-desc":
        list.sort((a, b) => toPriceSortable(b) - toPriceSortable(a));
        break;
      case "name-asc":
      default:
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [props.products, category, query, sort]);

  function applyUrl(next: { category?: string; q?: string; sort?: string }) {
    const nextParams = new URLSearchParams(sp.toString());
    setParam(nextParams, "category", next.category ?? category);
    setParam(nextParams, "q", next.q ?? query);
    setParam(nextParams, "sort", next.sort ?? sort);

    const qs = nextParams.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function onCategoryChange(v: string) {
    setCategory(v);
    applyUrl({ category: v });
  }

  function onSortChange(v: string) {
    setSort(v);
    applyUrl({ sort: v });
  }

  function onSubmitSearch(e: React.FormEvent) {
    e.preventDefault();
    applyUrl({ q: query });
  }

  function clearAll() {
    setQuery("");
    setCategory("");
    setSort("name-asc");
    router.push(pathname);
  }

  // 1) Load basket from localStorage on first client render
useEffect(() => {
  try {
    const raw = localStorage.getItem(BASKET_STORAGE_KEY);
    if (!raw) return;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;

    const obj = parsed as Record<string, unknown>;
    const cleaned: Record<string, number> = {};

    for (const [id, qty] of Object.entries(obj)) {
      const n = typeof qty === "number" ? qty : Number(qty);
      if (Number.isFinite(n) && n > 0) cleaned[id] = Math.min(99, Math.floor(n));
    }

    setBasket(cleaned);
  } catch {
    // Ignore corrupted storage
  }
}, []);

// 2) Save basket to localStorage whenever it changes
useEffect(() => {
  try {
    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
  } catch {
    // Ignore quota / privacy mode issues
  }
}, [basket]);


  return (
    <section className="space-y-4">
      {/* Controls */}
      <div className="rounded-2xl border p-4">
        <div className="grid gap-3 md:grid-cols-3">
          {/* Search */}
          <form onSubmit={onSubmitSearch} className="md:col-span-1">
            <label className="block text-sm font-medium">Search</label>
            <div className="mt-1 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. palm oil, suya, 1L"
                className="w-full rounded-lg border px-3 py-2"
              />
              <button className="rounded-lg bg-black px-4 py-2 text-sm text-white" type="submit">
                Search
              </button>
            </div>
          </form>

          {/* Category */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="">All categories</option>
              {props.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="mt-2 flex flex-wrap gap-2">
              {props.categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${encodeURIComponent(c.id)}`}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-gray-50"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium">Sort</label>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="price-asc">Price (Low → High)</option>
              <option value="price-desc">Price (High → Low)</option>
            </select>

            <button onClick={clearAll} className="mt-3 text-sm underline" type="button">
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filtered.length}</span> item(s)
        </p>

        <div className="mt-4 rounded-2xl border p-4">
  <div className="flex items-center justify-between">
    <p className="font-medium">Basket ({basketCount})</p>

    <a
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      className={`rounded-lg px-4 py-2 text-sm text-white ${
        basketItems.length ? "bg-black" : "bg-gray-400 pointer-events-none"
      }`}
    >
      Send order on WhatsApp
    </a>
  </div>

  {basketItems.length === 0 ? (
    <p className="mt-2 text-sm text-gray-600">Add items below to build your order.</p>
  ) : (
    <ul className="mt-3 space-y-2 text-sm">
      {basketItems.map(({ product, qty }) => (
        <li key={product.id} className="flex justify-between">
          <span>{product.name} x{qty}</span>
          <button
            className="text-xs underline"
            onClick={() => removeFromBasket(product)}
          >
            remove
          </button>
        </li>
      ))}
    </ul>
  )}
</div>

      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-6">
          <p className="font-medium">No results found.</p>
          <p className="mt-1 text-sm text-gray-600">
            Try a different search term or clear your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          
          {filtered.map((p) => (
  <ProductCard
    key={p.id}
    product={p}
    showWhatsApp={false}     // we use the basket builder to send one WhatsApp message
    qty={basket[p.id] ?? 0}
    onAdd={addToBasket}
    onRemove={removeFromBasket}
  />
))}


        </div>
      )}
    </section>
  );
}
