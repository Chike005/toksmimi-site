"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BasketItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  slug?: string;
  quantity: number;
};

export default function BasketClient() {
  const [basket, setBasket] = useState<BasketItem[]>([]);

  useEffect(() => {
    const savedBasket = localStorage.getItem("basket");
    if (savedBasket) {
      setBasket(JSON.parse(savedBasket));
    }
  }, []);

  function updateBasket(newBasket: BasketItem[]) {
    setBasket(newBasket);
    localStorage.setItem("basket", JSON.stringify(newBasket));
  }

  function increaseQuantity(id: string) {
    const updated = basket.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );

    updateBasket(updated);
  }

  function decreaseQuantity(id: string) {
    const updated = basket
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);

    updateBasket(updated);
  }

  function removeItem(id: string) {
    const updated = basket.filter((item) => item.id !== id);
    updateBasket(updated);
  }

  function clearBasket() {
    updateBasket([]);
  }

  const total = basket.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Your Basket</h1>

      {basket.length === 0 ? (
        <div className="rounded-lg border p-6">
          <p className="mb-4 text-gray-600">Your basket is empty.</p>

          <Link
            href="/"
            className="inline-block rounded bg-black px-5 py-3 text-white hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {basket.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-600">
                    £{item.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Subtotal: £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="rounded border px-3 py-1"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="rounded border px-3 py-1"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-4 text-sm text-red-600 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border p-6">
            <div className="mb-4 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>

            <div className="flex gap-4">
              <Link
                href="/"
                className="rounded border px-5 py-3 hover:bg-gray-100"
              >
                Continue Shopping
              </Link>

              <button
                onClick={clearBasket}
                className="rounded border px-5 py-3 text-red-600 hover:bg-red-50"
              >
                Clear Basket
              </button>

              <button
                className="rounded bg-black px-5 py-3 text-white hover:bg-gray-800"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}