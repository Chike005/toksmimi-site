import fs from 'fs';
import path from 'path';
import Papa from 'papaparse'; 

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





