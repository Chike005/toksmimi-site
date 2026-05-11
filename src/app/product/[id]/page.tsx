import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/data/catalog";
import { loadProductsFromCsv } from "@/data/products.server";
import { BackButton } from "@/components/BackButton";
import { AddToBasketButton } from "@/components/AddToBasketButton";

const WHATSAPP_NUMBER = "074402277896";

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = loadProductsFromCsv();
  const product = products.find((p) => p.id === id);

  if (!product) notFound();

  const categoryName =
    categories.find((c) => c.id === product.categoryId)?.name ?? "Category";

  const priceText =
    typeof product.priceGBP === "number"
      ? formatGBP(product.priceGBP)
      : "Message for price";

  const waText = `Hi, I’d like to order: ${product.name}${
    product.unit ? ` (${product.unit})` : ""
  }. Please confirm availability and total price.`;

  return (
    <main className="mx-auto max-w-5xl p-6">

      <div className="mb-6">
        <BackButton />
      </div>
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-slate-600 dark:text-slate-300">
          
            <Link className="underline" href="/shop">
              Shop
            </Link>{" "}
            / <span>{categoryName}</span>
          </p>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-slate-600 dark:text-slate-300">
            {product.unit ? `${product.unit} • ` : ""}
            {priceText}
          </p>
        </div>

        

        <Link className="text-sm underline" href="/">
          Home
        </Link>
      </header>

      <section className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Availability
              </p>
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  product.inStock
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {product.inStock ? "In stock" : "Out of stock"}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-300">Category</p>
              <p className="font-medium">{categoryName}</p>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-300">Price</p>
              <p className="font-medium">{priceText}</p>
            </div>

            <AddToBasketButton productId={product.id} inStock={product.inStock} />

            <a
              className={`mt-6 inline-block w-full rounded-lg px-4 py-3 text-center text-sm ${
                product.inStock
                  ? "bg-black text-white dark:bg-slate-50 dark:text-slate-900"
                  : "bg-slate-400 text-white pointer-events-none dark:bg-slate-700 dark:text-slate-300"
              }`}
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                waText
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              {product.inStock ? "Order on WhatsApp" : "Currently unavailable"}
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="font-medium">Product information</p>

            {product.description ? (
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                {product.description}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                No description available yet.
              </p>
            )}

            <div className="mt-4">
              <p className="text-sm font-medium">Ingredients</p>
              {product.ingredients && product.ingredients.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {product.ingredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Ingredients not listed.
                </p>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium">Allergens</p>
              {product.allergens && product.allergens.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.allergens.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  No known allergens listed.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}