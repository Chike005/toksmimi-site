

export type CategoryId = "rice" | "spices" | "oils" | "tin" | "snacks" | "drinks";

export type Product = {
  id: string;
  name: string;
  categoryId: CategoryId;
  priceGBP?: number;
  unit?: string;
  inStock: boolean;
  image: string; // /public path
  
};

export const categories: { id: CategoryId; name: string }[] = [
  { id: "rice", name: "Rice & Grains" },
  { id: "spices", name: "Spices" },
  { id: "oils", name: "Oils" },
  { id: "tin", name: "Tin & Cans" },
  { id: "snacks", name: "Snacks" },
  { id: "drinks", name: "Drinks" },
];

export const products: Product[] = [
  {
    id: "palm-oil-1l",
    name: "Red Palm Oil",
    categoryId: "oils",
    priceGBP: 6.99,
    unit: "1L",
    inStock: true,
    image: "/products/palm-oil.jpg",
  },
  {
    id: "suya-spice-100g",
    name: "Suya Spice Mix",
    categoryId: "spices",
    priceGBP: 3.49,
    unit: "100g",
    inStock: true,
    image: "/products/suya.jpg",
  },
];
