"use client";

import { useState } from "react";

const BASKET_STORAGE_KEY = "toksmimi:basket:v1";

type AddToBasketButtonProps = {
  productId: string;
  inStock: boolean;
};

export function AddToBasketButton({
  productId,
  inStock,
}: AddToBasketButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!inStock) return;

    try {
      const raw = localStorage.getItem(BASKET_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : {};

      const next = {
        ...current,
        [productId]: (current[productId] ?? 0) + 1,
      };

      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("toksmimi:basket"));

      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (error) {
      console.error("Failed to add item to basket:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!inStock}
      className={`mt-3 w-full rounded-lg px-4 py-3 text-center text-sm ${
        inStock
          ? "bg-black text-white dark:bg-slate-50 dark:text-slate-900"
          : "bg-slate-400 text-white cursor-not-allowed dark:bg-slate-700 dark:text-slate-300"
      }`}
    >
      {!inStock ? "Currently unavailable" : added ? "Added to basket ✓" : "Add to Basket"}
    </button>
  );
}