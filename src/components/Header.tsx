"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const BASKET_STORAGE_KEY = "toksmimi:basket:v1";

function getBasketCountFromStorage(): number {
  try {
    const raw = localStorage.getItem(BASKET_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return 0;

    return Object.values(parsed).reduce((sum: number, v: unknown) => {
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) && n > 0 ? sum + Math.floor(n) : sum;
    }, 0);
  } catch {
    return 0;
  }
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

    const [basketCount, setBasketCount] = useState(0);

  useEffect(() => {
    // Initial read
    setBasketCount(getBasketCountFromStorage());

    // Update when localStorage changes (cross-tab) or when we dispatch our custom event
    const onStorage = (e: StorageEvent) => {
      if (e.key === BASKET_STORAGE_KEY) setBasketCount(getBasketCountFromStorage());
    };

    const onBasketEvent = () => setBasketCount(getBasketCountFromStorage());

    window.addEventListener("storage", onStorage);
    window.addEventListener("toksmimi:basket", onBasketEvent as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("toksmimi:basket", onBasketEvent as EventListener);
    };
  }, []);


  useEffect(() => {
    // Keep header input in sync with URL
    if (pathname === "/shop") {
      const next = (sp.get("q") ?? "").trim();
      setQ(next);
    } else {
      // Clear search when leaving the shop page
      setQ("");
    }
  }, [pathname, sp]);

  // If you're on /shop and already have a query, reflect it in the header input
  const initial = useMemo(() => {
    if (pathname !== "/shop") return "";
    return (sp.get("q") ?? "").trim();
  }, [pathname, sp]);

  const [q, setQ] = useState(initial);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();

    if (!query) {
      router.push("/shop");
      return;
    }

    router.push(`/shop?q=${encodeURIComponent(query)}`);
  }

  
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold">
            ToksMimi Foods
          </Link>

                    <nav className="flex items-center gap-4 text-sm">
            <Link href="/shop" className="hover:underline">
              Shop
            </Link>

            <Link href="/shop#basket" className="hover:underline">
              Basket ({basketCount})
            </Link>
          </nav>

        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products… (e.g., garri, rice, oil)"
            className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm
               text-slate-900 placeholder:text-slate-400
               dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-400 md:w-[360px]`}
          />
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}