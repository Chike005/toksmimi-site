"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/shop");
    }
  }

  return (
    <button
      onClick={handleBack}
      className="text-sm underline"
      type="button"
    >
      ← Back
    </button>
  );
}