

export type CategoryId =
  | "rice"
  | "grains"
  | "tubers"
  | "spices"
  | "oils"
  | "snacks"
  | "fish"
  | "dairy"
  | "drinks"
  | "tin";


export type Product = {
  id: string;
  name: string;
  categoryId: CategoryId;
  priceGBP?: number;
  unit?: string;
  inStock: boolean;
  image: string; // /public path

  description?: string;
  ingredients?: string[]; // structured list is easier to render
  allergens?: string[];   // structured list, can be empty
  
};

export const categories: { id: CategoryId; name: string }[] = [
  { id: "rice", name: "Rice" },
  { id: "grains", name: "Grains & Flour" },
  { id: "tubers", name: "Tubers" },
  { id: "spices", name: "Spices & Seasoning" },
  { id: "oils", name: "Oils" },
  { id: "snacks", name: "Snacks" },
  { id: "fish", name: "Fish & Seafoods" },
  { id: "dairy", name: "Dairy" },
  { id: "drinks", name: "Drinks" },
  { id: "tin", name: "Tin & Cans" },
];


import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

// Load products from CSV
const csvPath = path.join(process.cwd(), 'data', 'products.csv');
const csvData = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

export const products: Product[] = parsed.data.map((row: any) => ({
  id: row.id,
  name: row.name,
  categoryId: row.categoryId as CategoryId,
  priceGBP: row.priceGBP ? parseFloat(row.priceGBP) : undefined,
  unit: row.unit || undefined,
  inStock: row.inStock === 'true',
  image: row.image,
  description: row.description || undefined,
  ingredients: row.ingredients ? row.ingredients.split(',').map((s: string) => s.trim()) : [],
  allergens: row.allergens ? row.allergens.split(',').map((s: string) => s.trim()) : [],
}));
