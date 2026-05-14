export function safeInternalPath(input: string | null | undefined, fallback = "/"): string {
  if (!input) return fallback;

  // Only allow relative paths
  if (!input.startsWith("/")) return fallback;
  // Block protocol-relative URLs like //evil.com
  if (input.startsWith("//")) return fallback;

  try {
    // Parse with a base to normalize, then re-check origin
    const url = new URL(input, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;

    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}