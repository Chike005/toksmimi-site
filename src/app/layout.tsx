import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://toksmimi.com"),

  title: {
    default: "ToksMimi Foods | Afro-Caribbean & Nigerian Groceries",
    template: "%s | ToksMimi Foods",
  },



  description:
    "Shop Afro-Caribbean and Nigerian groceries, drinks, spices, rice, flour, snacks and everyday food essentials from ToksMimi Foods.",

  keywords: [
    "ToksMimi Foods",
    "African groceries",
    "Nigerian groceries",
    "Afro-Caribbean groceries",
    "African food Manchester",
    "Nigerian food Manchester",
    "African grocery store Manchester",
  ],

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    title: "ToksMimi Foods | Afro-Caribbean & Nigerian Groceries",
    description:
      "Shop Afro-Caribbean and Nigerian groceries, drinks, spices, rice, flour, snacks and everyday food essentials.",
    siteName: "ToksMimi Foods",
  },

  twitter: {
    card: "summary_large_image",
    title: "ToksMimi Foods | Afro-Caribbean & Nigerian Groceries",
    description:
      "Shop Afro-Caribbean and Nigerian groceries, drinks, spices, rice, flour, snacks and everyday food essentials.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50`}
      >
        <Suspense
          fallback={
            <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <div className="mx-auto max-w-6xl p-4">
                <span className="text-lg font-semibold">
                  ToksMimi Foods
                </span>
              </div>
            </header>
          }
        >
          <Header />
        </Suspense>

        <main>{children}</main>
      </body>
    </html>
  );
}