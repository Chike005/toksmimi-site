import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  title: "ToksMimi Foods | Afro-Caribbean & Nigerian Groceries",
  description:
    "Shop Afro-Caribbean and Nigerian groceries, food essentials, drinks, spices and more from ToksMimi Foods.",
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