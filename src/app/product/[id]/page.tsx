import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, products } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";


const WHATSAPP_NUMBER = "447845068117"; // replace with your client number (no +)


function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}



export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = products.find((p) => p.id === resolvedParams.id);

  if (!product) notFound();

  const categoryName =
    categories.find((c) => c.id === product.categoryId)?.name ?? "Category";

  const priceText =
    typeof product.priceGBP === "number" ? formatGBP(product.priceGBP) : "Message for price";

  const waText = `Hi, I’d like to order: ${product.name}${
    product.unit ? ` (${product.unit})` : ""
  }. Please confirm availability and total price.`;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            <Link className="underline" href="/shop">
              Shop
            </Link>{" "}
            / <span>{categoryName}</span>
          </p>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-gray-600">
            {product.unit ? `${product.unit} • ` : ""}
            {priceText}
          </p>
        </div>

        <Link className="text-sm underline" href="/">
          Home
        </Link>
      </header>

      <section className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="rounded-2xl border p-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="rounded-2xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">Availability</p>
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  product.inStock ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                {product.inStock ? "In stock" : "Out of stock"}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-medium">{categoryName}</p>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-medium">{priceText}</p>
            </div>

            <a
              className={`mt-6 inline-block w-full rounded-lg px-4 py-3 text-center text-sm text-white ${
                product.inStock ? "bg-black" : "bg-gray-400 pointer-events-none"
              }`}
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noreferrer"
            >
              {product.inStock ? "Order on WhatsApp" : "Currently unavailable"}
            </a>

            <p className="mt-3 text-xs text-gray-500">
              Orders are confirmed via WhatsApp. Delivery/pickup details are agreed after ordering.
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="font-medium">Product information</p>

            {product.description ? (
              <p className="mt-2 text-sm text-gray-700">{product.description}</p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">No description available yet.</p>
            )}

            <div className="mt-4">
              <p className="text-sm font-medium">Ingredients</p>
              {product.ingredients && product.ingredients.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {product.ingredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-600">Ingredients not listed.</p>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium">Allergens</p>
              {product.allergens && product.allergens.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.allergens.map((a) => (
                    <span key={a} className="rounded-full bg-yellow-100 px-3 py-1 text-xs">
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-600">No known allergens listed.</p>
              )}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Please contact us on WhatsApp if you have allergy concerns. Product details may vary by supplier.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
