import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/catalog";

const WHATSAPP_NUMBER = "447845068117"; // replace (no +)

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

export type ProductCardProps = {
  product: Product;

  // Optional: show WhatsApp button (default true)
  showWhatsApp?: boolean;

  // Optional: basket controls
  qty?: number; // current quantity in basket (0/undefined means not in basket)
  onAdd?: (product: Product) => void;
  onRemove?: (product: Product) => void;
};

export function ProductCard({
  product,
  showWhatsApp = true,
  qty = 0,
  onAdd,
  onRemove,
}: ProductCardProps) {
  const priceText =
    typeof product.priceGBP === "number" ? formatGBP(product.priceGBP) : "Message for price";

  const waText = `Hi, I will like to order: ${product.name}${product.unit ? ` (${product.unit})` : ""}`;
 
  const detailsHref = `/product/${product.id}`;

  const basketEnabled = typeof onAdd === "function" || typeof onRemove === "function";

  return (
    <div className="rounded-2xl border p-3">
      {/* Clickable image */}
      <Link href={detailsHref} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={detailsHref} className="block truncate font-medium hover:underline">
            {product.name}
          </Link>

          <p className="text-sm text-gray-600">
            {product.unit ? `${product.unit} • ` : ""}
            {priceText}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs ${
            product.inStock ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          {product.inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      {/* Optional: basket controls */}
      {basketEnabled && qty === 0 && (
        <button
          type="button"
          className="mt-3 inline-block w-full rounded-lg bg-black px-3 py-2 text-center text-sm text-white"
          onClick={() => onAdd?.(product)}
          disabled={!product.inStock}
        >
          Add to Basket
        </button>
      )}

      {basketEnabled && qty > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm"
            onClick={() => onRemove?.(product)}
          >
            -
          </button>

          <div className="flex-1 rounded-lg border py-2 text-center text-sm">
            Qty: <span className="font-medium">{qty}</span>
          </div>

          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm"
            onClick={() => onAdd?.(product)}
            disabled={!product.inStock}
          >
            +
          </button>
        </div>
      )}

      {/* Optional: WhatsApp ordering button */}
      {showWhatsApp && (
        <a
          className={`mt-3 inline-block w-full rounded-lg px-3 py-2 text-center text-sm text-white ${
            product.inStock ? "bg-black" : "bg-gray-400 pointer-events-none"
          }`}
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noreferrer"
        >
          Order on WhatsApp
        </a>
      )}
    </div>
  );
}
