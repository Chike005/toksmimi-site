"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";

const WHATSAPP_NUMBER = "447845068117"; // wa.me expects no "+"
const BASKET_STORAGE_KEY = "toksmimi:basket:v1";

type Category = { id: string; name: string };

type BasketItem = {
  product: Product;
  qty: number;
};

type DeliveryType = "delivery" | "pickup";

type CustomerDetails = {
  name: string;
  area: string;
  time: string;
  type: DeliveryType;
};

function setParam(urlParams: URLSearchParams, key: string, value: string) {
  if (!value) urlParams.delete(key);
  else urlParams.set(key, value);
}

function toPriceSortable(p: Product): number {
  return typeof p.priceGBP === "number" ? p.priceGBP : Number.POSITIVE_INFINITY;
}

function buildWhatsAppBasketMessage(items: BasketItem[], customer: CustomerDetails): string {
  const lines: string[] = [];

  lines.push("Hi ToksMimi Foods 👋");
  lines.push("I would like to place an order:");
  lines.push("");

  items.forEach((it, idx) => {
    const unit = it.product.unit ? ` (${it.product.unit})` : "";
    const price =
      typeof it.product.priceGBP === "number" ? ` • £${it.product.priceGBP.toFixed(2)}` : "";
    lines.push(`${idx + 1}) ${it.product.name}${unit} x${it.qty}${price}`);
  });

  const subtotal = items.reduce((sum, it) => {
    const price = typeof it.product.priceGBP === "number" ? it.product.priceGBP : 0;
    return sum + price * it.qty;
  }, 0);

  const hasUnpriced = items.some((it) => typeof it.product.priceGBP !== "number");

  lines.push("");
  lines.push(`Estimated subtotal: £${subtotal.toFixed(2)}`);
  if (hasUnpriced) {
    lines.push("(Some items don’t have a listed price—please confirm final total.)");
  }

  lines.push("");
  lines.push(`Order type: ${customer.type === "delivery" ? "Delivery 🚚" : "Pickup 🏪"}`);
  lines.push(`Name: ${customer.name || "N/A"}`);
  if (customer.type === "delivery") lines.push(`Area: ${customer.area || "N/A"}`);
  lines.push(`Preferred time: ${customer.time || "N/A"}`);

  lines.push("");
  lines.push("Please confirm availability and total price. Thank you 🙏");

  return lines.join("\n");
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

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");

  // Basket state: { [productId]: qty }
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

  function scrollToBasketSection() {
    const el = document.getElementById("basket");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const basketItems: BasketItem[] = useMemo(() => {
    const map = new Map(props.products.map((p) => [p.id, p]));
    return Object.entries(basket)
      .map(([id, qty]) => {
        const product = map.get(id);
        return product ? { product, qty } : null;
      })
      .filter(Boolean) as BasketItem[];
  }, [basket, props.products]);

  const basketCount = useMemo(() => basketItems.reduce((sum, i) => sum + i.qty, 0), [basketItems]);

  const customer: CustomerDetails = useMemo(
    () => ({
      name: customerName.trim(),
      area: deliveryArea.trim(),
      time: deliveryTime.trim(),
      type: deliveryType,
    }),
    [customerName, deliveryArea, deliveryTime, deliveryType]
  );

  const canOrder = basketItems.length > 0 && customer.name.length > 0;

  const whatsappHref = useMemo(() => {
    if (!canOrder) return "";
    const text = buildWhatsAppBasketMessage(basketItems, customer);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }, [canOrder, basketItems, customer]);

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

  // Load basket from localStorage once
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
      // ignore
    }
  }, []);

  // Save basket whenever it changes + notify header
  useEffect(() => {
    try {
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
      window.dispatchEvent(new Event("toksmimi:basket"));
    } catch {
      // ignore
    }
  }, [basket]);

  // Smooth-scroll when hitting /shop#basket
  useEffect(() => {
    const run = () => {
      if (window.location.hash === "#basket") {
        const el = document.getElementById("basket");
        if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    };

    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, []);

  return (
    <section className="space-y-4">
      {/* Mobile sticky basket bar */}
      <div className="md:hidden">
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl items-center gap-3 p-3">
            <button
              type="button"
              onClick={scrollToBasketSection}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
            >
              <span className="font-medium">Basket</span>{" "}
              <span className="text-slate-600 dark:text-slate-300">({basketCount})</span>
            </button>

            <a
                href={canOrder ? whatsappHref : undefined}
                target="_blank"
                rel="noreferrer"
                role="button"
              tabIndex={canOrder ? 0 : -1}
              className={`mt-4 block w-full rounded-lg px-4 py-3 text-center text-sm ${
                canOrder
                  ? "bg-black text-white dark:bg-slate-50 dark:text-slate-900"
                  : "bg-gray-400 text-white pointer-events-none opacity-70 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              Order on WhatsApp
            </a>

          </div>
        </div>

        {/* Spacer so content isn't hidden behind the fixed bar */}
        <div className="h-20" />
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-3">
          {/* Search */}
          <form onSubmit={onSubmitSearch} className="md:col-span-1">
            <label htmlFor="shop-search" className="block text-sm font-medium">
              Search
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="shop-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. palm oil, suya, 1L"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
              />
              <button
                className="rounded-lg bg-black px-4 py-2 text-sm text-white dark:bg-slate-50 dark:text-slate-900"
                type="submit"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category */}
          <div className="md:col-span-1">
            <label htmlFor="category-select" className="block text-sm font-medium">
              Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
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
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-50 dark:hover:bg-slate-800"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="md:col-span-1">
            <label htmlFor="sort-select" className="block text-sm font-medium">
              Sort
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
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

      {/* Desktop layout: products left, basket right */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* Left column */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Showing <span className="font-medium">{filtered.length}</span> item(s)
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-medium">No results found.</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Try a different search term or clear your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  showWhatsApp={false}
                  qty={basket[p.id] ?? 0}
                  onAdd={addToBasket}
                  onRemove={removeFromBasket}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column (desktop sticky basket) */}
        <aside className="hidden md:block md:col-span-4">
          <div className="sticky top-24">
            <div
              id="basket"
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">Basket</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Items selected: <span className="font-medium">{basketCount}</span>
                  </p>
                </div>

                <button
                  onClick={clearBasket}
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                  disabled={basketItems.length === 0}
                >
                  Clear
                </button>
              </div>

              {basketItems.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Your basket is empty. Add items on the left.
                </p>
              ) : (
                <>
                  <div className="mt-4 space-y-3">
                    {basketItems.map(({ product, qty }) => (
                      <div key={product.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {product.unit ?? ""}{" "}
                            {typeof product.priceGBP === "number"
                              ? `• £${product.priceGBP.toFixed(2)}`
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                            onClick={() => removeFromBasket(product)}
                          >
                            -
                          </button>

                          <div className="w-12 rounded-lg border border-slate-200 bg-white py-1 text-center text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
                            {qty}
                          </div>

                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                            onClick={() => addToBasket(product)}
                            disabled={!product.inStock}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery details */}
                  <div className="mt-5 space-y-3">
                    <p className="text-sm font-medium">Delivery details</p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("delivery")}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          deliveryType === "delivery"
                            ? "bg-black text-white dark:bg-slate-50 dark:text-slate-900"
                            : "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                        }`}
                      >
                        Delivery
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType("pickup")}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          deliveryType === "pickup"
                            ? "bg-black text-white dark:bg-slate-50 dark:text-slate-900"
                            : "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                        }`}
                      >
                        Pickup
                      </button>
                    </div>

                    <input
                      placeholder="Your name (required)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                    />

                    {deliveryType === "delivery" && (
                      <input
                        placeholder="Delivery area (e.g. Manchester)"
                        value={deliveryArea}
                        onChange={(e) => setDeliveryArea(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                      />
                    )}

                    <input
                      placeholder="Preferred time (e.g. Today 6pm)"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                    />
                  </div>

                  <a
                    href={canOrder ? whatsappHref : undefined}
                    target="_blank"
                    rel="noreferrer"
                    role="button"
                    tabIndex={canOrder ? 0 : -1}
                    className={`mt-4 block w-full rounded-lg px-4 py-3 text-center text-sm ${
                      canOrder
                        ? "bg-black text-white dark:bg-slate-50 dark:text-slate-900"
                        : "bg-gray-400 text-white pointer-events-none opacity-70 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Order on WhatsApp
                  </a>


                  {!canOrder && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      Add at least 1 item and enter your name to place an order.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
