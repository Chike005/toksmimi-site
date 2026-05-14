// src/data/products.server.ts
import "server-only";

import Papa from "papaparse";
import fs from "fs";
import path from "path";
import type { Product, CategoryId } from "./catalog";

export function loadProductsFromCsv(): Product[] {
  const csvPath = path.join(process.cwd(), "data", "products.csv");
  const csvData = fs.readFileSync(csvPath, "utf8");

  const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

  return (parsed.data as any[]).map((row) => ({
    id: String(row.id).trim(),
    name: String(row.name).trim(),
    categoryId: String(row.categoryId).trim() as CategoryId,

    priceGBP: row.priceGBP ? Number.parseFloat(String(row.priceGBP)) : undefined,
    unit: row.unit ? String(row.unit).trim() : undefined,
    inStock: String(row.inStock).trim().toLowerCase() === "true",

    // IMPORTANT: ensure it starts with "/" so Next can serve it from /public
    image: String(row.image).trim().startsWith("/")
      ? String(row.image).trim()
      : `/${String(row.image).trim()}`,

    description: row.description ? String(row.description).trim() : undefined,

    ingredients: row.ingredients
      ? String(row.ingredients)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],

    allergens: row.allergens
      ? String(row.allergens)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  }));
}