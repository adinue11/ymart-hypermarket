import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import "./styles/fx.css";

const container = document.getElementById("root");
if (!container) throw new Error("YMART mount element #root is missing.");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(container).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);

// The service worker only caches the app shell and same-origin build assets.
// Supabase, R2, authentication, and other API responses are never cached here.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("YMART offline support could not be registered:", error);
    });
  }, { once: true });
}

/* Boot curtain: show for a short, fixed beat (fonts permitting), then split open. */
const boot = document.getElementById("boot");
const started = performance.now();
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 500))]);

fonts.then(() => {
  const wait = reduced ? 0 : Math.max(0, 350 - (performance.now() - started));
  setTimeout(() => {
    window.__ymartReady = true;
    document.documentElement.classList.add("is-ready");
    window.dispatchEvent(new Event("ymart:ready"));
    boot?.classList.add("boot--out");
    setTimeout(() => boot?.remove(), 1300);
  }, wait);
});
